import logging
import pathlib
import os

logging.basicConfig(level=logging.INFO)

basedir = pathlib.Path(__file__).parents[1]
os.chdir(basedir)

