# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-06-14 05:49
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import djgeojson.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Author',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=64)),
                ('last_name', models.CharField(max_length=64)),
                ('bio', models.CharField(max_length=512)),
                ('date_of_birth', models.DateField()),
            ],
        ),
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=64)),
                ('abstract', models.CharField(max_length=512)),
                ('authors', models.ManyToManyField(to='core.Author')),
            ],
        ),
        migrations.CreateModel(
            name='BookBatch',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event', models.CharField(max_length=64)),
                ('country', models.CharField(max_length=64)),
                ('geom', djgeojson.fields.PointField()),
                ('date', models.DateField()),
            ],
            options={
                'verbose_name_plural': 'Book batches',
            },
        ),
        migrations.CreateModel(
            name='BookHolding',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.CharField(max_length=140)),
                ('review', models.CharField(max_length=512)),
                ('is_owner', models.BooleanField(default=False)),
                ('holder', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='BookInstance',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('access_code', models.CharField(max_length=64, unique=True)),
                ('arrived', models.BooleanField(default=False)),
                ('batch', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.BookBatch')),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.Book')),
                ('holders', models.ManyToManyField(to='core.BookHolding')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='BookLocation',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('geom', djgeojson.fields.PointField()),
                ('time', models.DateTimeField()),
                ('book_holding', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.BookHolding')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
