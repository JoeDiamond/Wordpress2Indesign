try {
    myFont = app.fonts.item("Arial");
}
catch (myError) { };
var myDocument = app.documents.add();
var csvfolder = new Folder("/c/Users/Joe/Documents/WordpressConversion/pythonScript/out/");
var foldercontent = csvfolder.getFiles("*.csv");

var paraStyleTitle = myDocument.paragraphStyles.add({spaceBefore: "5mm", spaceAfter: "2mm"});
paraStyleTitle.name = "StyleDailyHeader";
paraStyleTitle.appliedFont = "Arial"
paraStyleTitle.fontStyle = "Bold"
paraStyleTitle.pointSize = "24pt";
myDocument.paragraphStyles.add({ name: "StyleDailyBody", pointSize: 10, });

with (myDocument) {
    var myTextFrame = myDocument.pages.item(0).textFrames.add();
    myTextFrame.geometricBounds = ["10mm", "10mm", "280mm", "200mm"];
    myTextFrame.textFramePreferences.textColumnCount = 2;
    //myTextFrame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH
    for (var i = 0; i < foldercontent.length; i++) {
        var file = new File(foldercontent[i]);
        if (file.open()) {
            var s = file.read();
            var values = s.split("|");
            myTextFrame.parentStory.insertionPoints.item(-1).contents = values[1];
            myTextFrame.paragraphs[-1].appliedParagraphStyle = "StyleDailyHeader";
            myTextFrame.parentStory.insertionPoints.item(-1).contents = "\r";
            myTextFrame.parentStory.insertionPoints.item(-1).contents = values[2]
            myTextFrame.paragraphs[-1].appliedParagraphStyle = "StyleDailyBody";
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

                    var rect = myFoundItems[0].insertionPoints[0].rectangles.add({ geometricBounds: [0, 0, 40, 90], strokeWeight: 0 });
                    rect.place(new File("/C/Users/Joe/Documents/WordpressConversion/pythonScript/imgs/" + linkname));
                    rect.fit(FitOptions.PROPORTIONALLY);
                    myFoundItems[0].remove()
                    
                    // Check if the text frame has overflown
                    var oldTextFrame = myDocument.pages[-1].textFrames[0];
                    if (oldTextFrame.overflows) {
                        myDocument.pages.add(LocationOptions.AT_END);
                        var newTextFrame = myDocument.pages[-1].textFrames.add();
                        newTextFrame.textFramePreferences.textColumnCount = 2;
                        newTextFrame.geometricBounds = ["10mm", "10mm", "280mm", "200mm"];
                       oldTextFrame.nextTextFrame = newTextFrame;
                        //newTextFrame.previousTextFrame = lastTextFrame;
                    }
                }
                else { break; }
            }
            file.close()
            myTextFrame.parentStory.insertionPoints.item(-1).contents = "\r";
        }
    }
}
//myTextFrame.geometricBounds = ["14mm", "14mm", "14mm", "14mm"];
//myTextFrame.contents = "Hello World";