# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-10-08 12:54
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0008_bookowning_secondary'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('url', models.URLField()),
                ('holder', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'User Profile',
            },
        ),
        migrations.AlterField(
            model_name='bookholding',
            name='holder',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='holdings', to=settings.AUTH_USER_MODEL),
        ),
    ]
