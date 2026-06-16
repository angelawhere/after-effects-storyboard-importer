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
    templateDpi: 72, // 72 if eyeballed from a screen image, 300 if measured in Illustrator/Photoshop
    compWidth: 1920,
    compHeight: 1080,
    frameRate: 24
};

function getNextItemName(baseName, itemType) {
    var existing = {};
    for (var i = 1; i <= app.project.numItems; i++) {
        var item = app.project.item(i);
        if (!itemType ||
            (itemType === "comp" && item instanceof CompItem) ||
            (itemType === "folder" && item instanceof FolderItem)) {
            existing[item.name] = true;
        }
    }
    if (!existing[baseName]) return baseName;
    for (var v = 2; v < 1000; v++) {
        var candidate = baseName + " (" + v + ")";
        if (!existing[candidate]) return candidate;
    }
    return baseName + " (999)";
}

function main() {
    var proj = app.project;
    if (!proj) {
        alert("Please open a project first.");
        return;
    }

    app.beginUndoGroup("Storyboard Import");

    var lastFolder = app.settings.haveSetting("StoryboardImporter", "lastFolder")
        ? app.settings.getSetting("StoryboardImporter", "lastFolder") : "";
    var folder = Folder.selectDialog("Select folder containing storyboard page images", lastFolder);
    if (!folder) return;
    app.settings.saveSetting("StoryboardImporter", "lastFolder", folder.fsName);

    var allFiles = folder.getFiles();
    var imageFiles = [];
    for (var f = 0; f < allFiles.length; f++) {
        var file = allFiles[f];
        if (file instanceof File && /\.(png|jpg|jpeg|tif|tiff)$/i.test(file.name)) {
            imageFiles.push(file);
        }
    }

    if (imageFiles.length === 0) {
        alert("No image files found in the selected folder.");
        return;
    }

    imageFiles.sort(function(a, b) {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    });

    var dpiScale = SETTINGS.templateDpi / 72;
    var panels = SETTINGS.panelCentres;
    var numPanels = panels.length;
    var fps = SETTINGS.frameRate;
    var compW = SETTINGS.compWidth;
    var compH = SETTINGS.compHeight;
    var scalePct = (compH / (SETTINGS.panelHeight * dpiScale)) * 100;
    var layerDuration = numPanels;
    var totalDuration = layerDuration * imageFiles.length;

    var baseName = folder.name;
    var compName = getNextItemName(baseName, "comp");
    var folderName = getNextItemName(baseName, "folder");
    var importFolder = proj.items.addFolder(folderName);

    var comp = proj.items.addComp(compName, compW, compH, 1, totalDuration, fps);
    comp.bgColor = [1, 1, 1];

    for (var i = 0; i < imageFiles.length; i++) {
        var file = imageFiles[i];
        var startTime = i * layerDuration;

        var io = new ImportOptions(file);
        io.sequence = false;
        var footage = proj.importFile(io);
        footage.parentFolder = importFolder;

        var layer = comp.layers.add(footage, layerDuration);
        layer.startTime = startTime;

        layer.property("Transform").property("Position").setValue([compW / 2, compH / 2]);
        layer.property("Transform").property("Scale").setValue([scalePct, scalePct]);

        var ap = layer.property("Transform").property("Anchor Point");
        for (var p = 0; p < numPanels; p++) {
            var keyTime = startTime + p;
            var centre = panels[p];
            ap.setValueAtTime(keyTime, [centre[0] * dpiScale, centre[1] * dpiScale]);
            var keyIndex = ap.nearestKeyIndex(keyTime);
            ap.setInterpolationTypeAtKey(keyIndex, KeyframeInterpolationType.HOLD); // hold, not linear, so the anchor jumps between panels
        }
    }

    app.endUndoGroup();
    comp.openInViewer();

    alert(
        "Done!\n" +
        imageFiles.length + " page(s) imported\n" +
        numPanels + " panels per page\n" +
        "Scale: " + Math.round(scalePct) + "%\n" +
        "Total duration: " + totalDuration + "s"
    );
}

main();
