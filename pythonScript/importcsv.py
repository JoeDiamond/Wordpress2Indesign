#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys

try:
    # Please do not use 'from scribus import *' . If you must use a 'from import',
    # Do so _after_ the 'import scribus' and only import the names you need, such
    # as commonly used constants.
    import scribus
except ImportError, err:
    print "This Python script is written for the Scribus scripting interface."
    print "It can only be run from within Scribus."
    sys.exit(1)

#########################
# YOUR IMPORTS GO HERE  #
#########################
import csv
import glob
import os


def main(argv):
    os.chdir("C:\Users\Joe\Documents\WordpressConversion\pythonScript\out")
    if haveDoc():
        setUnit(UNIT_MILLIMETERS)
        for file in glob.glob("*.csv"):
            with open(file) as csvfile:
                #print(file)
                newPage(-1)
                txtBoxTitle = createText(15,15,180,15)
                txtBox1 = createText(15, 35, 180, 248)
                setColumns(2,txtBox1)
                setColumnGap(4,txtBox1)
                csv_reader = csv.reader(csvfile, delimiter='|')
                for row in csv_reader:
                    for col in row[2:]:
                        insertText(col, -1, txtBox1)
                        #setText(row[2], txtBox1)
                    setText(row[1],txtBoxTitle)
                if textOverflows(txtBox1):
                    newPage(-1)
                    txtBox2=createText(15, 15, 180, 248)
                    #txtBox2 = createText(108, 15, 87, 268)
                    linkTextFrames(txtBox1,txtBox2)
                    setColumns(2, txtBox2)
                    setColumnGap(4, txtBox2)
    os.chdir("C: \Users\Joe\Documents\WordpressConversion\pythonScript")

def main_wrapper(argv):
    try:
        scribus.statusMessage("Running script...")
        scribus.progressReset()
        main(argv)
    finally:
        if scribus.haveDoc():
            scribus.setRedraw(True)
        scribus.statusMessage("")
        scribus.progressReset()

if __name__ == '__main__':
    main_wrapper(sys.argv)
