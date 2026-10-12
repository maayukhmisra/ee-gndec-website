# GNDEC Electrical Engineering - Document Repository Structure

This directory (`web/themes/custom/gndec/documents/`) contains the version-controlled reference documents, official academic syllabi, institutional guidelines, minutes of meetings, and timetable assets used across the GNDEC Electrical Engineering Department portal.

---

## 📁 Directory Taxonomy

| Directory | Content Description | Associated Drupal Entity / View |
| :--- | :--- | :--- |
| `attendance_criteria/` | Official attendance rules and departmental criteria | `attendance_criteria` |
| `blooms_taxonomy/` | Bloom's Taxonomy question stem charts and rubrics | `blooms_taxonomy` |
| `bos/` | Board of Studies (BOS) minutes of meetings & senate notifications (2014–2026) | `bos_document` / `bos_documents` |
| `expert_talks/` | Departmental expert talk reports and event documentation | `expert_talk` |
| `general/` | General departmental documentation and advisory board records | General / Advisory |
| `mou/` | Industry MOUs, collaboration agreements, and workshop reports | `mou_document`, `mou_file` / `mou_and_related_docs` |
| `postgraduate_guidelines/` | M.Tech / PhD thesis submission format & CD guidelines | `postgrad_guideline` / `postgraduate_students` |
| `prerequisites_schematics/` | Curriculum mapping schematics and professional body participation | `mapping_doc` / `mapping_docs` |
| `programme_seats/` | Sanctioned student intake per programme | `academic_document` (Sanctioned Seats) |
| `scheme_and_syllabus/` | Official study schemes and course syllabi | `academic_document` / `academic_documents` |
| ├── `btech/` | B.Tech Electrical Engineering study schemes & syllabi | Category: *B.Tech Syllabus & Study Schemes* |
| ├── `mtech/` | M.Tech Power Engineering (FT/PT) schemes & syllabi | Category: *M.Tech Syllabus & Schemes* |
| └── `phd/` | Ph.D. Electrical Engineering study scheme & syllabus | Category: *Ph.D. Syllabus & Study Scheme* |
| `timetables/` | Departmental timetables partitioned by academic year | `time_table` & `timetable_document` |
| ├── `2017-2018/` | Session July 2017 – May 2018 | |
| ├── `2018/` | Session July 2018 – November 2018 | |
| ├── `2019/` | Session January 2019 – December 2019 | |
| ├── `2020/` | Session January 2020 – December 2020 | |
| ├── `2021/` | Session January 2021 – December 2021 | |
| ├── `2022/` | Session January 2022 – December 2022 | |
| ├── `2023/` | Session January 2023 – December 2023 | |
| ├── `2024/` | Session January 2024 – December 2024 | |
| ├── `2025/` | Session January 2025 – December 2025 | |
| └── `2026/` | Session January 2026 – December 2026 | |
| `undergraduate_guidelines/` | B.Tech training formats, project guidelines, and rubrics | `undergrad_guideline` / `undergraduate_students` |
| `vision/` | PEOs, POs, attainment tools, and program outcomes | `attainment_tools_doc`, `mtech_power_engg_doc` |

---

## 📐 Standards & Conventions for New Documents

When adding or updating files in this repository:

1. **Naming Conventions**:
   - Use clear, descriptive, human-readable file titles matching the frontend display name (e.g. `Time-Table (Groups) Session Aug 2026-Dec 2026.html`).
   - Avoid shell-breaking characters such as pipes (`|`), unescaped quotes (`"`), or trailing whitespace before extensions.
   - For multi-year archives or session-based files, prefix or suffix with the relevant academic session / year.

2. **Categorization**:
   - Keep syllabus files partitioned strictly under `scheme_and_syllabus/<programme>/` (`btech`, `mtech`, `phd`).
   - Place all academic timetable releases in the appropriate `timetables/<academic_year>/` subfolder.

3. **Runtime vs Codebase Storage**:
   - **Codebase Repository (`web/themes/custom/gndec/documents/`)**: Tracks authoritative source copies in git, organized by category and academic year.
   - **Drupal Public Uploads (`web/sites/default/files/`)**: Served by the web server at runtime (excluded from git in `.gitignore`).

---

## 🌐 Runtime Directory Structure (`web/sites/default/files/`)

All managed Drupal files and runtime assets in `web/sites/default/files/` follow a clean, standardized hierarchy:

```
web/sites/default/files/
├── documents/                         # Document uploads organized by bundle
│   ├── academic_document/             # Syllabi, study schemes, and sanctioned seats
│   ├── attainment_tools_doc/          # Attainment tools documentation
│   ├── attendance_criteria/           # Attendance criteria policies
│   ├── blooms_taxonomy/               # Bloom's taxonomy charts
│   ├── bos_document/                  # Board of Studies meeting minutes (18 files)
│   ├── expert_talks/                  # Expert talk reports & documents
│   ├── mapping_doc/                   # Curriculum mapping schematics
│   ├── mou_document/                  # MOU agreements and activity reports
│   ├── mou_file/                      # Departmental advisor lists
│   ├── mtech_power_engg_doc/          # M.Tech Power Engineering docs
│   ├── postgrad_guideline/            # Post-graduate guidelines
│   ├── timetables/                    # 77 active timetable files (named after frontend titles)
│   └── undergrad_guideline/           # Under-graduate guidelines
├── faculty_photos/                    # All 19 faculty member & HOD portrait photos
├── 2026-08/ & 2026-09/                # Date-stamped hero banner & general page media
├── styles/                            # Drupal image style derivative thumbnails/crops
├── css/ & js/                         # Drupal aggregated & compressed frontend assets
└── php/                               # Drupal compiled Twig templates cache
```

