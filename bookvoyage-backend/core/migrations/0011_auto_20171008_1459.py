# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-10-08 12:59
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_auto_20171008_1458'),
    ]

    operations = [
        migrations.RenameField(
            model_name='userprofile',
            old_name='holder',
            new_name='user',
        ),
    ]
