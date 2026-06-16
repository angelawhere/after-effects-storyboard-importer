# Storyboard Importer

An After Effects script that imports storyboard pages as a basic animatic. Each page becomes one layer with hold keyframes on the anchor point, one per panel, one second each.

A companion Photoshop script batch exports pages from a layered PSD.

## Files

- `ae_storyboard_importer.jsx` - AE import script
- `ps_storyboard_exporter.jsx` - Photoshop export script
- `storyboard_template.ai` - Illustrator template (editable)
- `storyboard_template.png` - template reference image
- `storyboard_template.psd` - Photoshop template with sample images

## Requirements

- After Effects (any recent version)
- Photoshop (for the exporter)
- File > Scripts > Run Script File access enabled

To enable scripting: in AE go to Edit > Preferences > Scripting & Expressions and turn on Allow Scripts to Write Files and Access Network. In Photoshop, Edit > Preferences > Scripts > Allow Scripts to Access the Network. Restart after changing.

## AE Importer

### Quick start

If you're using the provided template (1920x1080 panels, 1920x1080 comp), no changes to the script are needed.

1. Draw your boards on the template, one page per file
2. Export as PNG or JPEG, named in order: p01.png, p02.png, etc.
3. Put all pages in one folder, named after your scene (SC01, Sc_opening, etc.)
4. In AE: File > Scripts > Run Script File > ae_storyboard_importer.jsx
5. Select your scene folder

The script creates one comp and one footage folder, both named after the source folder. Re-running creates versioned duplicates (2), (3), and so on.

Image files are sorted alphabetically. With ten or more pages, zero-pad filenames (p01 not p1).

### Custom template

Open `ae_storyboard_importer.jsx` in a text editor and edit the SETTINGS block:

```javascript
var SETTINGS = {
    panelCentres: [
        [1700, 1520],
        [1700, 2600],
        [1700, 3680],
        [1700, 4760],
        [1700, 5840]
    ],
    panelWidth: 1920,
    panelHeight: 1080,
    templateDpi: 72,
    compWidth: 1920,
    compHeight: 1080,
    frameRate: 24
};
```

Panel centres are in reading order, matching your template's coordinate space. Find them by drawing a rectangle over each panel in Illustrator or Photoshop and reading the centre position and dimensions from the transform properties.

If you measured coordinates at 72 dpi, leave templateDpi at 72. If you're exporting at 300 dpi in Illustrator, keep your AI coordinates as measured and set this to 300 - the script scales them up automatically.

If your panel ratio differs from your comp ratio, the script scales each page so the panel height fills the comp height.

## Photoshop Exporter

Organise your PSD so each page is a separate top-level folder, named in order (p01, p02, etc.). Layers outside folders are ignored. Hide any layers you don't want exported before running.

Run via File > Scripts > Browse > `ps_storyboard_exporter.jsx`. Select an output folder. One PNG is exported per folder, named after the folder. All layer visibility is restored afterwards. You'll be prompted before any existing files are overwritten.

## Troubleshooting

Script won't run: enable scripting in preferences (see Requirements above).

Panels are off-centre or wrong scale: open the image you're importing, draw a rectangle over each panel and read the coordinates and dimensions directly. Use those values in SETTINGS and set templateDpi to 72.

Wrong page order: check filenames are zero-padded if you have ten or more pages.

Pages exporting blank: check artwork is inside a folder layer, not on a loose layer.
