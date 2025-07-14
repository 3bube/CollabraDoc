#!/bin/bash
# This script helps with deployment setup

# Upgrade pip
pip install --upgrade pip

# Install wheel for better package handling
pip install wheel

# Install with binary preference
pip install --prefer-binary -r requirements.txt
