try {
    myFont = app.fonts.item("Arial");
}
catch (myError) { };
var myDocument = app.documents.add();
var csvfolder = new Folder("/c/Users/Joe/Documents/WordpressConversion/pythonScript/out/");
var foldercontent = csvfolder.getFiles("*.csv");

var paraStyleTitle = myDocument.paragraphStyles.add();
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
            myTextFrame.parentStory.insertionPoints.item(-1).contents = values[1] + "\r";
            myTextFrame.paragraphs[-1].appliedParagraphStyle = "StyleDailyHeader";
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
                        //rect = myDocument.rectangles.add();
                        //rect.geometricBounds = ["0mm", "0mm", "40mm", "90mm"]
                        //rect.anchoredObjectSettings.insertAnchoredObject(myFoundItems[0].insertionPoints[0], AnchorPosition.INLINE_POSITION);
                        //myRect.anchoredObjectSettings.insertAnchoredObject(myTextFrame.parentStory.insertionPoints[0], AnchorPosition.INLINE_POSITION);
                        //var item = myFoundItems[myCounter].insertionPoints[0].place(new File("/c/UmbauArduinoRegler.png"), false,{fit: FitOptions.PROPORTIONALLY});

                        
                        var rect = myFoundItems[0].insertionPoints[0].rectangles.add( {geometricBounds:[0,0, 40, 90 ]} );
                        rect.place ( new File("/c/UmbauArduinoRegler.png") );
                        rect.fit ( FitOptions.PROPORTIONALLY  );
                        myFoundItems[0].contents = "\r"
                        //item.fit(fitOptions.PROPORTIONALLY);
                        //
                        // myRect.fit(FitOptions.CONTENT_TO_FRAME);
                        //myRect.fit(FitOptions.PROPORTIONALLY);
                        //myRect.fit(FitOptions.CENTER_CONTENT);
                        //myTextFrame.parentStory.insertionPoints.item(-1).contents = "\r";
                        // Check if the text frame has overflown
                }
                else{break;}
            }
            file.close()

            // Check if the text frame has overflown
            if (myTextFrame.overflows) {
                myDocument.pages.add(LocationOptions.AT_END);
                var lastTextFrame = myDocument.pages[-1].textFrames.add();
                lastTextFrame.textFramePreferences.textColumnCount = 2;
                lastTextFrame.geometricBounds = ["10mm", "10mm", "280mm", "200mm"];
                myTextFrame.nextTextFrame = lastTextFrame;
            }
        }
    }
}
//myTextFrame.geometricBounds = ["14mm", "14mm", "14mm", "14mm"];
//myTextFrame.contents = "Hello World";