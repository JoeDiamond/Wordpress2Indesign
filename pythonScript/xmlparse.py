from lxml import etree as ET
import dateutil.parser
#import xml.etree.ElementTree as ET
import os
import requests
import unidecode
import datetime
import re
#import pytz
import time
import codecs
import csv
from extractlinks import extractlinks

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

    def adjust_paths(self, attachments=None, prefix=''):
        if prefix is not '' and not prefix.endswith('/'):
            print("[ERRR] Your attachment prefix does not end in a trailing slash")
            return False
        if self.body is not None and attachments is not None:
            for attachment in attachments:
                if attachment.url in self.body:
                    new_url = prefix + attachment.url.split('/')[-1]
                    self.body = self.body.replace(attachment.url, new_url)
                    if DEBUG:
                        print("[DEBG] Replaced " +
                              attachment.url + " with " + new_url)

    def fix_paragraphs(self):
        fixed = self.body.replace('\n', '</p><p>')
        fixed = '<p>' + fixed + '</p>'
        fixed = fixed.replace('</p><p></p><p>', '</p><p>')
        self.body = fixed

    def fix_more(self):
        fixed = self.body.replace('<!--more-->', '[[MORE]]')
        self.body = fixed


class Attachment:
    def __init__(self, id=None, title=None, url=None):
        self.id = id
        self.title = title
        self.url = url

    def download(self, path='attachments'):
        if self.url is not None:
            title = self.url.split('/')[-1]
            attachment = requests.get(self.url)
            if attachment.status_code == requests.codes.ok:
                f = open(os.path.join(path, title), 'wb')
                f.write(attachment.content)
                f.close()
            else:
                attachment.raise_for_status()


# Regular Expression to remove html tags from a string. It is assumed that the tags
# are well formed, i.e. there are no opening without closing angular parenthesis
TAG_RE = re.compile(r'<[^>]+>')


def remove_tags(text, links):
    # print(text)
    for l in links:
        # print(l)
        searchText = "<a.*" + re.escape(l[1]) + ".*>.*<img.*>.*</a>"
        # print(searchText)
        text = re.sub(searchText, "[[" + l[1] + "]]", text)

    # Split and filter out empty strings from array
#  listOfPosts = list(filter(None, TAG_RE.split(text)))
 #   for idx in range(len(listOfPosts)):
   #     # or l in listOfPosts:
  #      if listOfPosts[idx][0] is "\"":
     #       listOfPosts[idx] = listOfPosts[idx][1:]
    #    if listOfPosts[idx][-1] is "\"":
      #      listOfPosts[idx] = listOfPosts[idx][:-1]
     #   # print(l)
     #   if listOfPosts[idx][-1] is "\n" or listOfPosts[idx][-1] is "\r":
     #       listOfPosts[idx] = listOfPosts[idx][:-1]
     #   # print(l)
     #   #print(list(filter(None, l.split('\n\n'))))
     #   listOfPosts[idx] = "".join(
     #       list(filter(None, listOfPosts[idx].split('\n\n')))) """
    return text


def get_posts(xmlfile):
    tree = ET.parse(xmlfile)
    # 'C:\\Users\\Joe\\Downloads\\luegmairblog.wordpress.2019-06-16_changed.xml'
    namespaces = tree.getroot().nsmap
    posts = []
    # Get all the posts
    for post_elem in tree.xpath(".//item[wp:post_type='post']", namespaces=namespaces):
        print("=====================================================================")
        post = Post(post_elem.find("./wp:post_id",
                                   namespaces=namespaces).text, post_elem.find("./title").text)
        post.url = post_elem.find("./link").text
        post.body = post_elem.find(
            "./content:encoded", namespaces=namespaces).text.replace("\"\"", "\"")
        # print(post.body)
        post.post_date = dateutil.parser.parse(post_elem.find(
            "./wp:post_date", namespaces=namespaces).text)
        #print("EXTRACTING LINKS!")
        post.links = extractlinks(post.body)
        # print(post.links)
        post.body = remove_tags(post.body, post.links)
        # print(post.body)
        posts.append(post)
    return posts


# run when called from command line
posts = get_posts(
    'C:\\Users\\Joe\\Downloads\\luegmairblog.wordpress.2019-06-16_changed.xml')

for post in posts:
    # print("==================")
    with open("./out/"+post.post_date.strftime("%Y-%m-%d_%H-%M-%S") + ".csv", mode='w', encoding='utf-8') as post_file:
        post_writer = csv.writer(
            post_file, delimiter='|', quotechar='"', quoting=csv.QUOTE_MINIMAL)

        entries = [post.post_date.strftime(
            "%Y-%m-%d_%H-%M-%S"), post.title]
        entries.extend([post.body])
        # print(entries)
        post_writer.writerow(entries)
