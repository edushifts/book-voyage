# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-07-13 23:08
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_auto_20170712_2039'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bookowning',
            name='book_instance',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='ownings', to='core.BookInstance'),
        ),
    ]
