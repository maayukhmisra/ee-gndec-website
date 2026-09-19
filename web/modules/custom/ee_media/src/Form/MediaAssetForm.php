<?php

namespace Drupal\ee_media\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Database\Database;
use Drupal\Core\Url;

/**
 * Admin form to Add or Edit a Media Asset.
 *
 * Used at:
 *   /admin/ee-gndec/media/add
 *   /admin/ee-gndec/media/{id}/edit
 *
 * This form is the central interface for uploading and cataloguing all
 * PDF/image assets used across Notices, Events, Research, and Labs.
 */
class MediaAssetForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'ee_media_asset_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, int $id = NULL): array {
    // If an ID is given, load existing record for editing.
    $asset = NULL;
    if ($id) {
      $asset = Database::getConnection()
        ->select('ee_media_assets', 'm')
        ->fields('m')
        ->condition('m.id', $id)
        ->execute()
        ->fetchObject();
    }

    // Store ID in form state for use in submitForm.
    $form_state->set('asset_id', $id);

    $form['title'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Asset Title'),
      '#required'      => TRUE,
      '#maxlength'     => 512,
      '#default_value' => $asset ? $asset->title : '',
      '#placeholder'   => 'e.g. Mid-Semester Exam Schedule Nov 2024 (PDF)',
      '#description'   => $this->t('A clear, descriptive title for this media asset.'),
    ];

    $form['description'] = [
      '#type'          => 'textarea',
      '#title'         => $this->t('Description (optional)'),
      '#rows'          => 4,
      '#default_value' => $asset ? $asset->description : '',
      '#placeholder'   => 'Brief description of this file...',
    ];

    $form['file_url'] = [
      '#type'          => 'url',
      '#title'         => $this->t('File URL'),
      '#required'      => TRUE,
      '#maxlength'     => 2048,
      '#default_value' => $asset ? $asset->file_url : '',
      '#placeholder'   => 'https://example.com/files/document.pdf or /sites/default/files/...',
      '#description'   => $this->t('Full URL or root-relative path to the file. For Drupal-hosted files use <code>/sites/default/files/media/filename.pdf</code>.'),
    ];

    $form['file_type'] = [
      '#type'          => 'select',
      '#title'         => $this->t('File Type'),
      '#required'      => TRUE,
      '#options'       => [
        'pdf'         => $this->t('PDF Document'),
        'image'       => $this->t('Image (JPG / PNG / WebP)'),
        'document'    => $this->t('Word / Text Document'),
        'spreadsheet' => $this->t('Excel / Spreadsheet'),
        'other'       => $this->t('Other'),
      ],
      '#default_value' => $asset ? $asset->file_type : 'pdf',
    ];

    $form['file_size_kb'] = [
      '#type'          => 'number',
      '#title'         => $this->t('File Size (KB)'),
      '#min'           => 0,
      '#default_value' => $asset ? (int) $asset->file_size_kb : 0,
      '#description'   => $this->t('Approximate file size in kilobytes (for display purposes). Enter 0 if unknown.'),
    ];

    $form['module_ref'] = [
      '#type'          => 'select',
      '#title'         => $this->t('Owning Module'),
      '#required'      => TRUE,
      '#options'       => [
        'general'     => $this->t('General / Department'),
        'ee_notices'  => $this->t('Notices'),
        'ee_events'   => $this->t('Events'),
        'ee_research' => $this->t('Research & Publications'),
        'ee_labs'     => $this->t('Labs & Facilities'),
      ],
      '#default_value' => $asset ? $asset->module_ref : 'general',
      '#description'   => $this->t('Which module this asset belongs to. Use "General" for standalone department documents.'),
    ];

    $form['ref_id'] = [
      '#type'          => 'number',
      '#title'         => $this->t('Reference Record ID (optional)'),
      '#min'           => 0,
      '#default_value' => $asset ? (int) $asset->ref_id : 0,
      '#description'   => $this->t('If this asset is attached to a specific notice / event / publication / lab, enter its ID here. Leave 0 for standalone assets.'),
    ];

    $form['tags'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Tags (optional)'),
      '#maxlength'     => 1024,
      '#default_value' => $asset ? $asset->tags : '',
      '#placeholder'   => 'e.g. syllabus,2024,btech,exam',
      '#description'   => $this->t('Comma-separated keywords for search and filtering.'),
    ];

    $form['is_public'] = [
      '#type'          => 'checkbox',
      '#title'         => $this->t('Make this asset publicly visible via the API'),
      '#default_value' => $asset ? (int) $asset->is_public : 1,
    ];

    $form['status'] = [
      '#type'          => 'radios',
      '#title'         => $this->t('Status'),
      '#required'      => TRUE,
      '#options'       => [
        1 => $this->t('Active'),
        0 => $this->t('Archived'),
      ],
      '#default_value' => $asset ? (int) $asset->status : 1,
    ];

    $form['actions']['#type'] = 'actions';
    $form['actions']['submit'] = [
      '#type'       => 'submit',
      '#value'      => $id ? $this->t('Update Asset') : $this->t('Save Asset'),
      '#attributes' => ['class' => ['button', 'button--primary']],
    ];
    $form['actions']['cancel'] = [
      '#type'       => 'link',
      '#title'      => $this->t('Cancel'),
      '#url'        => Url::fromRoute('ee_media.admin.list'),
      '#attributes' => ['class' => ['button']],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $db  = Database::getConnection();
    $id  = $form_state->get('asset_id');
    $now = \Drupal::time()->getRequestTime();

    $tagsRaw = trim($form_state->getValue('tags'));
    // Normalise tags: lowercase, strip extra spaces around commas.
    if ($tagsRaw) {
      $tags = implode(',', array_map('trim', explode(',', strtolower($tagsRaw))));
    }
    else {
      $tags = NULL;
    }

    $fields = [
      'title'        => $form_state->getValue('title'),
      'description'  => $form_state->getValue('description') ?: NULL,
      'file_url'     => $form_state->getValue('file_url'),
      'file_type'    => $form_state->getValue('file_type'),
      'file_size_kb' => (int) $form_state->getValue('file_size_kb'),
      'module_ref'   => $form_state->getValue('module_ref'),
      'ref_id'       => (int) $form_state->getValue('ref_id'),
      'tags'         => $tags,
      'is_public'    => (int) $form_state->getValue('is_public'),
      'status'       => (int) $form_state->getValue('status'),
      'uid'          => (int) \Drupal::currentUser()->id(),
    ];

    if ($id) {
      // UPDATE existing asset record.
      $db->update('ee_media_assets')
        ->fields($fields)
        ->condition('id', $id)
        ->execute();
      $this->messenger()->addStatus($this->t('Media asset updated successfully.'));
    }
    else {
      // INSERT new asset record.
      $fields['created'] = $now;
      $db->insert('ee_media_assets')->fields($fields)->execute();
      $this->messenger()->addStatus($this->t('Media asset added successfully.'));
    }

    $form_state->setRedirectUrl(Url::fromRoute('ee_media.admin.list'));
  }

}
