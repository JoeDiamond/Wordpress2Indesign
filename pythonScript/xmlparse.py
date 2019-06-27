import logging
from lxml import etree as ET
import dateutil.parser
# import xml.etree.ElementTree as ET
import os
import requests
import unidecode
import datetime
import re
# import pytz
import time
import codecs
import csv
from extractlinks import extractlinks
import wget
from PIL import Image
DEBUG = False


def slugify(string):
    if string is not None:
        string = unidecode.unidecode(string).lower()
        return re.sub(r'\W+', '-', string)
    else:
        return ""


class Post:
    """ Ommitted from the XML standard:
            pubDate
            guid
            excerpt:encoded
            post_date_gmt
            post_type
            post_password
            is_sticky
    """

    def __init__(self, id=None, title=None):
        self.id = id
        self.title = title
        self.description = None
        self.creator = None
        self.body = None
        self.url = None
        self.post_date = datetime.datetime.now()
        self.comment_status = "open"
        self.ping_status = "open"
        self.slug = slugify(title)
        self.status = "publish"
        self.parent = None
        self.menu_order = 0
        self.tags = []
        self.categories = []
        self.comments = []


def remove_tags(text, links):
    # print(text)
    for l in links:
        # print(l[0])
        if l[0] is "a":
            searchText = "<a.*" + re.escape(l[1]) + ".*>.*<img.*>.*</a>"
        if l[0] is "img":
            searchText = "<img.*"+re.escape(l[1])+".*>"
        # print(searchText)
        head, tail = os.path.split(l[1])
        # print(tail)
        text = re.sub(searchText, "[[" + tail + "]]", text)
    return text


def get_posts(xmlfile):
    tree = ET.parse(xmlfile)
    # 'C:\\Users\\Joe\\Downloads\\luegmairblog.wordpress.2019-06-16_changed.xml'
    namespaces = tree.getroot().nsmap
    posts = []
    errorfile = open("./logs/errors.log", mode='w', encoding='utf-8')
    # Get all the posts
    for post_elem in tree.xpath(".//item[wp:post_type='post']", namespaces=namespaces):
        print("=====================================================================")

        post = Post(post_elem.find("./wp:post_id",
                                   namespaces=namespaces).text, post_elem.find("./title").text)
        post.url = post_elem.find("./link").text
        post.body = post_elem.find(
            "./content:encoded", namespaces=namespaces).text
        # .replace("\"\"", "\"")
        # print(post.body)
        post.post_date = dateutil.parser.parse(post_elem.find(
            "./wp:post_date", namespaces=namespaces).text)
        print(post.post_date)
        # print("EXTRACTING LINKS!")
        post.links = extractlinks(post.body)
        # print(post.links)
        for imgl in post.links:
            head, tail = os.path.split(imgl[1])
            # print(tail)
            targetPath = "./imgs/" + tail
            targetThumbPath = "./imgs/" + \
                os.path.splitext(tail)[0] + "_thumb.jpg"
            #print(targetThumbPath + "\r")
            if not os.path.isfile(targetPath):
                try:
                    print(imgl[1] + ": ")
                    wget.download(imgl[1], targetPath)
                except:
                    print("Error downloading\r")
                    errorfile.write(post.post_date.strftime(
                        "%Y-%m-%d_%H-%M-%S") + ": " + imgl[1]+"\r")
                print("\r")
            if not os.path.isfile(targetThumbPath) and os.path.isfile(targetPath):
                im = Image.open(targetPath)
                if(os.path.splitext(targetPath) is "gif" and im.is_animated):
                    im.seek(0)
                im.convert('RGB')
                im.thumbnail((1200, 1200), Image.ANTIALIAS)
                im.save(targetThumbPath, 'JPEG', quality=80)

        # print(post.links)
        post.body = remove_tags(post.body, post.links)
        # print(post.body)

        with open("./out/"+post.post_date.strftime("%Y-%m-%d_%H-%M-%S") + ".csv", mode='w', encoding='utf-8') as post_file:
            post_file.write(post.post_date.strftime(
                "%Y-%m-%d_%H-%M-%S") + "|" + post.title + "|" + post.body)
        posts.append(post)
    errorfile.close()
    return posts


# run when called from command line
posts = get_posts(
    'C:\\Users\\Joe\\Downloads\\luegmairblog.wordpress.2019-06-26(3).xml')

for post in posts:
    # print("==================")
    with open("./out/"+post.post_date.strftime("%Y-%m-%d_%H-%M-%S") + ".csv", mode='w', encoding='utf-8') as post_file:
        post_file.write(post.post_date.strftime(
            "%Y-%m-%d_%H-%M-%S") + "|" + post.title + "|" + post.body)
