function main() {
    var doc = app.activeDocument;
    if (!doc) {
        alert("Please open a document first.");
        return;
    }

    var lastPath = (function() {
        try {
            return app.getCustomOptions("StoryboardExporter").getString(stringIDToTypeID("lastFolder"));
        } catch (e) { return ""; }
    })();

    var outputFolder = Folder.selectDialog("Select output folder for exported pages", lastPath || "~");
    if (!outputFolder) return;

    try {
        var desc = new ActionDescriptor();
        desc.putString(stringIDToTypeID("lastFolder"), outputFolder.fsName);
        app.putCustomOptions("StoryboardExporter", desc, true);
    } catch (e) {}

    var allLayers = doc.layers;
    var folders = [];
    for (var i = 0; i < allLayers.length; i++) {
        if (allLayers[i].typename === "LayerSet") {
            folders.push(allLayers[i]);
        }
    }

    if (folders.length === 0) {
        alert("No folders found in the document.");
        return;
    }

    var originalVisibility = [];
    for (var i = 0; i < allLayers.length; i++) {
        originalVisibility.push({
            layer: allLayers[i],
            visible: allLayers[i].visible
        });
    }

    for (var i = 0; i < folders.length; i++) {
        folders[i].visible = false;
    }

    var willOverwrite = [];
    for (var i = 0; i < folders.length; i++) {
        var f = new File(outputFolder.fsName + "/" + folders[i].name + ".png");
        if (f.exists) willOverwrite.push(folders[i].name + ".png");
    }

    if (willOverwrite.length > 0) {
        var msg = willOverwrite.length + " file(s) already exist and will be overwritten:\n\n"
            + willOverwrite.join("\n") + "\n\nContinue?";
        if (!confirm(msg)) {
            for (var i = 0; i < originalVisibility.length; i++) {
                originalVisibility[i].layer.visible = originalVisibility[i].visible;
            }
            return;
        }
    }

    var pngOptions = new PNGSaveOptions();
    pngOptions.interlaced = false;

    for (var i = 0; i < folders.length; i++) {
        folders[i].visible = true;

        var file = new File(outputFolder.fsName + "/" + folders[i].name + ".png");
        var copy = doc.duplicate(); // duplicate so saving doesn't touch the actual open document
        copy.saveAs(file, pngOptions, true);
        copy.close(SaveOptions.DONOTSAVECHANGES);

        folders[i].visible = false;
    }

    for (var i = 0; i < originalVisibility.length; i++) {
        originalVisibility[i].layer.visible = originalVisibility[i].visible;
    }

    alert("Done! " + folders.length + " page(s) exported to:\n" + outputFolder.fsName);
}

main();
