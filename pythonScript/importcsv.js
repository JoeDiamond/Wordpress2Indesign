// Target InDesign CS6
#target indesign-8.0
var myDocument;
var NoCols = 4;
app.documentPresets[0].createPrimaryTextFrame = true;

if (app.documents.length == 0) {
    myDocument = app.documents.add({
        pageOrientation: PageOrientation.landscape
    });
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
            textFramePreferences.textColumnCount = NoCols,
                geometricBounds = ["10mm", "13.5mm", "200mm", "283.5mm"];
        }

    }
    with (pages[1]) {
        with (textFrames[0]) {
            textFramePreferences.textColumnCount = NoCols,
                geometricBounds = ["10mm", "13.5mm", "200mm", "283.5mm"];
        }
    }
}

// Get the list of posts
var csvfolder = new Folder("/c/Users/Joe/Documents/WordpressConversion/pythonScript/out/");
var foldercontent = csvfolder.getFiles("*.csv");

// Define the paragraph styles
try {
    myDocument.paragraphStyles.add({ spaceAfter: "2mm", pointSize: "18pt", fontStyle: "Bold", appliedFont: "Arial", name: "StyleDailyHeader" });
    myDocument.paragraphStyles.add({ name: "StyleDailyBody", pointSize: 10, });
    myDocument.paragraphStyles.add({ name: "StyleDailyDate", spaceBefore: "5mm", pointSize: 8, });
}
catch (Error) { }

with (myDocument) {
    var myTextFrame;
    with (pages[-1]) {
        appliedMaster = app.activeDocument.masterSpreads.item("A-Musterseite");
    }
    myTextFrame = myDocument.pages.item(-1).textFrames[0];
    for (var i = 0; i < foldercontent.length; i++) {
        var file = new File(foldercontent[i]);
        if (file.open()) {
            var s = file.read();
            var values = s.split("|");
            file.close()
            var datetime = values[0].split ("_");
            var date = datetime[0].split ("-");
            var postDate = new Date(date[0],date[1],date[2]);
            myDocument.stories[-1].insertionPoints.item(-1).contents = postDate.getDate()+ "." + (postDate.getMonth()+1) +"." + postDate.getFullYear()+ "\r";
            myDocument.stories[-1].paragraphs[-1].appliedParagraphStyle = "StyleDailyDate";
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
            // The question mark after the plus makes the search non-greedy, which is important when looking for the double angular brackets
            app.findGrepPreferences.findWhat = "\\\[\\\[.+?,[pl],[sd]\\\]\\\]";

            //Iterate until nothing more is found
            while (true) {
                var myFoundItems = myDocument.findGrep();
                if (myFoundItems.length != 0) {
                    // Trim to get the filename
                    linkname = myFoundItems[0].contents.substring(2, myFoundItems[0].contents.length - 6)
                    // Get the orientation of the image (this is not yet necessary for anything)
                    orientation = myFoundItems[0].contents.substring(myFoundItems[0].contents.length - 5, myFoundItems[0].contents.length - 4)
                    // The image size in s(ingle) and d(ouble), indicating how the image should be handled. Double indicating that two images should be placed nect to each other
                    imagesize = myFoundItems[0].contents.substring(myFoundItems[0].contents.length - 3, myFoundItems[0].contents.length - 2)
                    widthfactor = 1
                    if (orientation == "p")
                    {
                        widthfactor = 2
                    }
                    
                    var ErrorOccurred = false;
                    try {
                        
                        // Create a new rectangle to place the image in
                        var rect = myFoundItems[0].insertionPoints[0].rectangles.add(
                        { geometricBounds: [0, 0, 40, myTextFrame.textFramePreferences.textColumnFixedWidth/widthfactor], 
                            strokeWeight: 0});
                    }
                    catch (Error) {
                        ErrorOccurred = true;
                    }
                    if (ErrorOccurred) {
                        myDocument.pages.add();
                        myDocument.pages[-2].textFrames[0].nextTextFrame = myDocument.pages[-1].textFrames[0];
                        rect = myFoundItems[0].insertionPoints[0].rectangles.add(
                        { geometricBounds: [0, 0, 40, myTextFrame.textFramePreferences.textColumnFixedWidth/widthfactor], 
                            strokeWeight: 0 });
                    }
                    // Check if the text frame has overflown
                    addAndLinkPageAndFrame(myDocument);
                    ErrorOccurred = false;
                    var img;
                    try {
                        img = rect.place(new File("/C/Users/Joe/Documents/WordpressConversion/pythonScript/imgs/" + linkname.replace(".", "_thumb.")));
                    }
                    catch (Error) {
                        ErrorOccurred = true;
                    }
                    if (ErrorOccurred) {
                        myDocument.pages.add();
                        myDocument.pages[-2].textFrames[0].nextTextFrame = myDocument.pages[-1].textFrames[0];
                        img = rect.place(new File("/C/Users/Joe/Documents/WordpressConversion/pythonScript/imgs/" + linkname));
                    }
                    rect.fit(FitOptions.PROPORTIONALLY);

                    // Resize the rectangle, if the image is landscape
                    if (img[0].geometricBounds[3] - img[0].geometricBounds[1] > img[0].geometricBounds[2] - img[0].geometricBounds[0]) {
                        //Landscape image
                        var h = (img[0].geometricBounds[2] - img[0].geometricBounds[0]) / (img[0].geometricBounds[3] - img[0].geometricBounds[1]) * myDocument.pages[-1].textFrames[0].textFramePreferences.textColumnFixedWidth;

                        var x0 = rect.geometricBounds[1];
                        var y0 = rect.geometricBounds[0];
                        var x1 = rect.geometricBounds[3];
                        var y1 = y0+h;
                        rect.geometricBounds = [y0, x0, y1, x1];

                        rect.fit(FitOptions.FILL_PROPORTIONALLY);
                    }
                
                                    if (orientation == "p" && imagesize == "s")
                    {
                    rect.anchoredObjectSettings.anchoredPosition = AnchorPosition.ANCHORED;
                    rect.anchoredObjectSettings.anchorPoint = AnchorPoint.TOP_LEFT_ANCHOR;
                    rect.textWrapPreferences.textWrapMode = TextWrapModes.BOUNDING_BOX_TEXT_WRAP;
}
                    // Delete the found link
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
        oldTextFrame.nextTextFrame = myDocument.pages[-1].textFrames[0];
    }
}