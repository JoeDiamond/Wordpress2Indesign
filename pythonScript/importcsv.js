// Target InDesign CS6
#target indesign-8.0
var myDocument;
app.documentPresets[0].createPrimaryTextFrame = true;

if (app.documents.length == 0) {
    myDocument = app.documents.add({ 
        pageOrientation: PageOrientation.landscape });
}
else {
    myDocument = app.documents[0];
}

myDocument.viewPreferences.rulerOrigin = RulerOrigin.pageOrigin;
with (myDocument.documentPreferences) {
    pageOrientation = PageOrientation.landscape
}

with (myDocument.masterSpreads[0]) {
    with (pages[0]) {
        with (textFrames[0]) {
            textFramePreferences.textColumnCount = 3,
                geometricBounds = ["10mm", "10mm", "200mm", "280mm"];
        }

    }
    with (pages[1]) {
        with (textFrames[0]) {
            textFramePreferences.textColumnCount = 3,
                geometricBounds = ["10mm", "10mm", "200mm", "280mm"];
        }
    }
}

// Get the list of posts
var csvfolder = new Folder("/c/Users/Joe/Documents/WordpressConversion/pythonScript/out/");
var foldercontent = csvfolder.getFiles("*.csv");

// Define the paragraph styles
try {
    myDocument.paragraphStyles.add({ spaceBefore: "5mm", spaceAfter: "2mm", pointSize: "24pt", fontStyle: "Bold", appliedFont: "Arial", name: "StyleDailyHeader" });
    myDocument.paragraphStyles.add({ name: "StyleDailyBody", pointSize: 10, });
}
catch (Error) { }

with (myDocument) {
    var myTextFrame;
    with (pages[-1]) {
        appliedMaster = app.activeDocument.masterSpreads.item("A-Musterseite");
    }
    //if (myDocument.pages[-1].textFrames.length < 1) {
    //  myTextFrame = myDocument.pages.item(-1).textFrames.add();
    //}
    //else {

    myTextFrame = myDocument.pages.item(-1).textFrames[0];
    //}
    //myTextFrame.geometricBounds = ["10mm", "10mm", "200mm", "280mm"];
    //myTextFrame.textFramePreferences.textColumnCount = 3;
    //myTextFrame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH
    for (var i = 0; i < foldercontent.length; i++) {
        var file = new File(foldercontent[i]);
        if (file.open()) {
            var s = file.read();
            var values = s.split("|");
            file.close()
            myDocument.stories[-1].insertionPoints.item(-1).contents = values[1] + "\r";
            myDocument.stories[-1].paragraphs[-1].appliedParagraphStyle = "StyleDailyHeader";
            myDocument.stories[-1].insertionPoints.item(-1).contents = values[2] + "\r";
            myDocument.stories[-1].paragraphs[-1].appliedParagraphStyle = "StyleDailyBody";
            // Check if the text frame has overflown
            addAndLinkPageAndFrame(myDocument);

            // Find the links and replace them with images
            //Reset the findGrepPreferences to ensure that previous settings
            //do not affect the search.
            app.findGrepPreferences = NothingEnum.nothing;
            app.findObjectPreferences = app.changeGrepPreferences = NothingEnum.nothing;

            //Find the tags (since this is a JavaScript string, 
            //the backslashes must be escaped).
            app.findGrepPreferences.findWhat = "\\\[\\\[.+\\\]\\\]";
            while (true) {
                var myFoundItems = myDocument.findGrep();
                if (myFoundItems.length != 0) {
                    // Trim to get the filename
                    linkname = myFoundItems[0].contents.substring(2, myFoundItems[0].contents.length - 2)
                    var ErrorOccurred = false;
                    try {
                        // Create a new rectangle to place the image in
                        var rect = myFoundItems[0].insertionPoints[0].rectangles.add({ geometricBounds: [0, 0, 40, myTextFrame.textFramePreferences.textColumnFixedWidth], strokeWeight: 0 });
                    }
                    catch (Error) {
                        ErrorOccurred = true;
                        /*   if (Error.number == 11265) {
                               ErrorOccurred = true;
                           }
                           else { throw Error; }*/
                    }
                    if (ErrorOccurred) {
                        myDocument.pages.add();
                        var newTextFrame = myDocument.pages[-1].textFrames.add();
                        newTextFrame.textFramePreferences.textColumnCount = 3;
                        newTextFrame.geometricBounds = ["10mm", "10mm", "200mm", "280mm"];
                        myDocument.pages[-2].textFrames[0].nextTextFrame = newTextFrame;
                        rect = myFoundItems[0].insertionPoints[0].rectangles.add({ geometricBounds: [0, 0, 40, myTextFrame.textFramePreferences.textColumnFixedWidth], strokeWeight: 0 });
                    }
                    // Check if the text frame has overflown
                    addAndLinkPageAndFrame(myDocument);
                    ErrorOccurred = false;
                    try {
                        rect.place(new File("/C/Users/Joe/Documents/WordpressConversion/pythonScript/imgs/" + linkname.replace(".", "_thumb.")));
                    }
                    catch (Error) {
                        ErrorOccurred = true;
                        /*  if (Error.number == 11265) {
                              ErrorOccurred = true;
                          }
                          else { throw Error; }*/
                    }
                    if (ErrorOccurred) {
                        myDocument.pages.add();
                        var newTextFrame = myDocument.pages[-1].textFrames.add();
                        newTextFrame.textFramePreferences.textColumnCount = 3;
                        newTextFrame.geometricBounds = ["10mm", "10mm", "200mm", "280mm"];
                        myDocument.pages[-2].textFrames[0].nextTextFrame = newTextFrame;
                        rect.place(new File("/C/Users/Joe/Documents/WordpressConversion/pythonScript/imgs/" + linkname));
                    }
                    rect.fit(FitOptions.PROPORTIONALLY);
                    myFoundItems[0].remove()

                    // Check if the text frame has overflown
                    addAndLinkPageAndFrame(myDocument);
                }
                else { break; }
            }
            app.findGrepPreferences.findWhat = "\\n\{2,10\}";
            app.changeGrepPreferences.changeTo = "\\n";
            myDocument.changeGrep();
        }
    }
}

function addAndLinkPageAndFrame(myDocument) {
    var oldTextFrame = myDocument.textFrames[-1];

    if (oldTextFrame.overflows) {
        myDocument.pages.add(locationOptions = LocationOptions.AT_END);
        var newTextFrame = myDocument.pages[-1].textFrames.add();
        newTextFrame.textFramePreferences.textColumnCount = 3;
        newTextFrame.geometricBounds = ["10mm", "10mm", "200mm", "280mm"];
        oldTextFrame.nextTextFrame = newTextFrame;
    }
}