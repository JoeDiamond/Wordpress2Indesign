from extractlinks import extractlinks
import xml.etree

import re

TAG_RE = re.compile(r'<[^>]+>')

def remove_tags(text):
    return TAG_RE.sub('', text)

markup = """<a href=""http://www.rosaundgeorg.de/wp-content/uploads/2014/01/20140130_163057.jpg""><img class=""aligncenter size-large wp-image-1242"" alt=""20140130_163057"" src=""http://www.rosaundgeorg.de/wp-content/uploads/2014/01/20140130_163057-1024x206.jpg"" width=""625"" height=""125"" /></a>So grau es auch aussehen mag, irgendwie fand ich es auch schön - wegen mir hätte es auch mal so richtig doll das Wasser runterhauen können - dann wär der ganze Schnodder aus der Luft mal ""weg"". Naja! Jedenfalls wars ganz lustig, weil als ich auf dem Rückweg vom Einkaufen war und ganz glücklich die nasse Luft angeschaut habe, hat mich eine Frau vom Bürgersteig her angejodelt ""Finally its raining!! Great blabla (das ich nicht mehr so richtig verstanden habe)"" weil ich aber den Eindruck hatte, dass sie meine Freude über den Regen teilt, habe ich nur zurück gerufen ""Yeah, true - so true (oder sowas ^^)"". Also kann nicht nur ich mich an diesen Tropfen erfreuen :) Bin mal gespannt wie die grau-braune Natur so auf die Feuchtigkeit reagiert!! :D"""
markup = """<a href=""http://www.rosaundgeorg.de/wp-content/uploads/2014/01/20140130_163057.jpg""><img class=""aligncenter size-large wp-image-1242"" alt=""20140130_163057"" src=""http://www.rosaundgeorg.de/wp-content/uploads/2014/01/20140130_163057-1024x206.jpg"" width=""625"" height=""125"" /></a>So grau es auch aussehen mag, irgendwie fand ich es auch schön - wegen mir hätte es auch mal so richtig doll das Wasser runterhauen können - dann wär der ganze Schnodder aus der Luft mal ""weg"". Naja! Jedenfalls wars ganz lustig, weil als ich auf dem Rückweg vom Einkaufen war und ganz glücklich die nasse Luft angeschaut habe, hat mich eine Frau vom Bürgersteig her angejodelt ""Finally its raining!! Great blabla (das ich nicht mehr so richtig verstanden habe)"" weil ich aber den Eindruck hatte, dass sie meine Freude über den Regen teilt, habe ich nur zurück gerufen ""Yeah, true - so true (oder sowas ^^)"". Also kann nicht nur ich mich an diesen Tropfen erfreuen :) Bin mal gespannt wie die grau-braune Natur so auf die Feuchtigkeit reagiert!! :D

Aber apropos Einkaufen! Als ich heut Einkaufen war, hatte ich das Bedürfnis einen Kakao für Georg und mich zu kaufen. Wir haben Einen zum Backen, aber zu einer abendlichen heißen Schockolade ist er nicht sooo geeignet. Also Stand ich da, vor einer nicht allzu kleinen Auswahl an Trinkschockolade. Die Kabaprodukte hab ich gleich links liegen lassen - ich wollte guten Kakao, bitte NICHT vordosiert in kleinen Plastiktütchen.
Die wirklich einzige nicht vordosierte Variante war diese...
<img class=""aligncenter size-large wp-image-1243"" alt=""20140130_155042"" src=""http://www.rosaundgeorg.de/wp-content/uploads/2014/01/20140130_155042-768x1024.jpg"" width=""625"" height=""833"" />
<a href=""http://www.rosaundgeorg.de/wp-content/uploads/2014/01/20140130_155042.jpg""><img class=""aligncenter size-large wp-image-1243"" alt=""20140130_155042"" src=""http://www.rosaundgeorg.de/wp-content/uploads/2014/01/20140130_155042-768x1024.jpg"" width=""625"" height=""833"" /></a>"""

markup = markup.replace("\"\"", "\"")

print(markup)
print(extractlinks(markup))

#print(remove_tags(markup))
