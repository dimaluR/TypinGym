import pathlib
import os

basedir = pathlib.Path(__file__).parents[1]
os.chdir(basedir)

from app import config

config.run()
