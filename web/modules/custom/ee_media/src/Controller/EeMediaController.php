<?php

namespace Drupal\ee_media\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Database\Database;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\Core\Url;

/**
 * Controller for EE Media REST API and Admin UI.
 *
 * API endpoints:
 *   GET /api/media                          -- list all public active assets
 *   GET /api/media/{id}                     -- single asset by ID
 *   GET /api/media/module/{module_ref}      -- assets filtered by owning module
 *
 * Admin routes:
 *   /admin/ee-gndec/media                   -- list & manage all assets
 *   /admin/ee-gndec/media/{id}/delete       -- delete an asset
 *
 * This module centralizes the media handling that was previously scattered
 * across ee_notices, ee_events, ee_research, and ee_labs (each of which had
 * a plain attachment_url field). Assets stored here can be referenced by
 * any of those modules via (module_ref, ref_id).
 */
class EeMediaController extends ControllerBase {

  // -- Helpers ---------------------------------------------------------------

  /**
   * Returns a JsonResponse with CORS headers for dev convenience.
   */
  private function json(mixed $data, int $status = 200): JsonResponse {
    $response = new JsonResponse($data, $status);
    $response->headers->set('Access-Control-Allow-Origin', '*');
    $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return $response;
  }

  /**
   * Fetch a single active asset row from DB.
   */
  private function fetchOne(int $id): ?object {
    return Database::getConnection()
      ->select('ee_media_assets', 'm')
      ->fields('m')
      ->condition('m.id', $id)
      ->condition('m.status', 1)
      ->execute()
      ->fetchObject();
  }

  /**
   * Format a DB row as a clean API array.
   */
  private function formatAsset(object $row): array {
    return [
      'id'           => (int) $row->id,
      'title'        => $row->title,
      'description'  => $row->description,
      'file_url'     => $row->file_url,
      'file_type'    => $row->file_type,
      'file_size_kb' => (int) $row->file_size_kb,
      'module_ref'   => $row->module_ref,
      'ref_id'       => (int) $row->ref_id,
      'tags'         => $row->tags ? array_map('trim', explode(',', $row->tags)) : [],
      'is_public'    => (bool) $row->is_public,
      'created'      => (int) $row->created,
      'created_human' => date('d M Y', $row->created),
    ];
  }

  // -- Public JSON API -------------------------------------------------------

  /**
   * GET /api/media
   *
   * Query params:
   *   ?module_ref=ee_notices|ee_events|ee_research|ee_labs|general
   *   ?file_type=pdf|image|document|spreadsheet|other
   *   ?limit=20   (default 20, max 100)
   *   ?tags=syllabus  (partial match against tags field)
   */
  public function list(Request $request): JsonResponse {
    $db    = Database::getConnection();
    $query = $db->select('ee_media_assets', 'm')
      ->fields('m')
      ->condition('m.status', 1)
      ->condition('m.is_public', 1)
      ->orderBy('m.created', 'DESC');

    // Optional module_ref filter
    $validModules = ['ee_notices', 'ee_events', 'ee_research', 'ee_labs', 'general'];
    $moduleRef = $request->query->get('module_ref');
    if ($moduleRef && in_array($moduleRef, $validModules)) {
      $query->condition('m.module_ref', $moduleRef);
    }

    // Optional file_type filter
    $validTypes = ['pdf', 'image', 'document', 'spreadsheet', 'other'];
    $fileType = $request->query->get('file_type');
    if ($fileType && in_array($fileType, $validTypes)) {
      $query->condition('m.file_type', $fileType);
    }

    // Optional tag search (LIKE %tag%)
    $tag = $request->query->get('tags');
    if ($tag) {
      $query->condition('m.tags', '%' . Database::getConnection()->escapeLike($tag) . '%', 'LIKE');
    }

    // Limit
    $limit = min((int) ($request->query->get('limit', 20)), 100);
    $query->range(0, $limit);

    $rows   = $query->execute()->fetchAll();
    $assets = array_map([$this, 'formatAsset'], $rows);

    return $this->json([
      'status' => 'ok',
      'count'  => count($assets),
      'assets' => $assets,
    ]);
  }

  /**
   * GET /api/media/{id}
   */
  public function single(int $id, Request $request): JsonResponse {
    $row = $this->fetchOne($id);
    if (!$row) {
      return $this->json(['status' => 'error', 'message' => 'Media asset not found.'], 404);
    }
    return $this->json(['status' => 'ok', 'asset' => $this->formatAsset($row)]);
  }

  /**
   * GET /api/media/module/{module_ref}
   *
   * Convenience endpoint -- returns all public assets for a given module.
   * Also supports ?ref_id=N to narrow to a specific record.
   */
  public function byModule(string $module_ref, Request $request): JsonResponse {
    $validModules = ['ee_notices', 'ee_events', 'ee_research', 'ee_labs', 'general'];
    if (!in_array($module_ref, $validModules)) {
      return $this->json(['status' => 'error', 'message' => 'Unknown module reference.'], 400);
    }

    $db    = Database::getConnection();
    $query = $db->select('ee_media_assets', 'm')
      ->fields('m')
      ->condition('m.status', 1)
      ->condition('m.is_public', 1)
      ->condition('m.module_ref', $module_ref)
      ->orderBy('m.created', 'DESC');

    $refId = $request->query->get('ref_id');
    if ($refId && ctype_digit((string) $refId)) {
      $query->condition('m.ref_id', (int) $refId);
    }

    $limit = min((int) ($request->query->get('limit', 50)), 200);
    $query->range(0, $limit);

    $rows   = $query->execute()->fetchAll();
    $assets = array_map([$this, 'formatAsset'], $rows);

    return $this->json([
      'status'     => 'ok',
      'module_ref' => $module_ref,
      'count'      => count($assets),
      'assets'     => $assets,
    ]);
  }

  // -- Admin UI --------------------------------------------------------------

  /**
   * Admin listing page for all media assets.
   */
  public function adminList(): array {
    $db   = Database::getConnection();
    $rows = $db->select('ee_media_assets', 'm')
      ->fields('m')
      ->orderBy('m.created', 'DESC')
      ->execute()
      ->fetchAll();

    $header = [
      'ID', 'Title', 'Type', 'Module', 'File Size', 'Public', 'Status', 'Uploaded', 'Operations',
    ];

    $typeIcons = [
      'pdf'         => '📄',
      'image'       => '🖼️',
      'document'    => '📝',
      'spreadsheet' => '📊',
      'other'       => '📁',
    ];

    $tableRows = [];
    foreach ($rows as $row) {
      $icon = $typeIcons[$row->file_type] ?? '📁';
      $tableRows[] = [
        $row->id,
        $row->title,
        $icon . ' ' . strtoupper($row->file_type),
        str_replace('_', ' ', ucfirst($row->module_ref)),
        $row->file_size_kb ? $row->file_size_kb . ' KB' : '—',
        $row->is_public ? '✅ Yes' : '🔒 No',
        $row->status ? '✅ Active' : '⏸ Archived',
        date('d M Y', $row->created),
        [
          'data' => [
            '#type'  => 'operations',
            '#links' => [
              'edit' => [
                'title' => $this->t('Edit'),
                'url'   => Url::fromRoute('ee_media.admin.edit', ['id' => $row->id]),
              ],
              'delete' => [
                'title' => $this->t('Delete'),
                'url'   => Url::fromRoute('ee_media.admin.delete', ['id' => $row->id]),
              ],
            ],
          ],
        ],
      ];
    }

    $build['add_link'] = [
      '#type'       => 'link',
      '#title'      => $this->t('+ Add Media Asset'),
      '#url'        => Url::fromRoute('ee_media.admin.add'),
      '#attributes' => ['class' => ['button', 'button--primary']],
    ];

    $build['description'] = [
      '#markup' => '<p>' . $this->t(
        'This module centralizes all PDF and image attachments for the EE GNDEC website. Assets stored here are referenced by the <strong>Notices</strong>, <strong>Events</strong>, <strong>Publications</strong>, and <strong>Labs</strong> modules via the <em>module_ref</em> and <em>ref_id</em> fields.'
      ) . '</p>',
    ];

    $build['table'] = [
      '#type'   => 'table',
      '#header' => $header,
      '#rows'   => $tableRows,
      '#empty'  => $this->t('No media assets found. Add one above.'),
    ];

    $build['api_info'] = [
      '#markup' => '<p><strong>' . $this->t('API Endpoints:') . '</strong><br>'
        . '<code>GET /api/media</code> — all assets<br>'
        . '<code>GET /api/media/{id}</code> — single asset<br>'
        . '<code>GET /api/media/module/{module_ref}</code> — by module<br>'
        . $this->t('Supports query params: ?module_ref=, ?file_type=, ?tags=, ?limit=') . '</p>',
    ];

    return $build;
  }

  /**
   * Delete an asset record by ID and redirect back to admin list.
   */
  public function delete(int $id, Request $request): RedirectResponse {
    Database::getConnection()
      ->delete('ee_media_assets')
      ->condition('id', $id)
      ->execute();

    $this->messenger()->addStatus($this->t('Media asset #@id has been deleted.', ['@id' => $id]));
    return new RedirectResponse(Url::fromRoute('ee_media.admin.list')->toString());
  }

}
