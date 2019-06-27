import sys
from html.parser import HTMLParser


class MyHTMLParser(HTMLParser):
    links = []
    linkfound = False
    linkattr = {}

    def handle_starttag(self, tag, attrs):
        #print("Found tag: " + tag)
        if tag != 'a' and tag != 'img':
            return
        if tag == 'a' and not self.linkfound:
            #print ("Found link tag")
            self.linkfound = True
            self.linkattr = dict(attrs)
            # print(self.linkattr)
        if tag == 'img':
            #print("Found img tag")
            attr = dict(attrs)
            #print(attr)
            if self.linkfound:
                self.links.append(["a", self.linkattr["href"]])
            else:
                
                self.links.append(["img", attr["src"]])
            self.linkfound = False
        #print(self.links)

    def handle_endtag(self, tag):
        if tag != 'a':
            return
        if tag == 'a':
            self.linkfound = False
        


def extractlinks(htmlstr):
    parser = MyHTMLParser()
    parser.links = []
    #print("PARSING:" + htmlstr)
    parser.feed(htmlstr)
    return parser.links