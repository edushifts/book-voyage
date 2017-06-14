# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-06-14 15:22
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
                ('date_of_birth', models.DateField()),
                ('bio', models.CharField(max_length=512)),
            ],
        ),
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=64)),
                ('abstract', models.CharField(max_length=512)),
                ('cover', models.ImageField(upload_to='bookCovers')),
                ('authors', models.ManyToManyField(to='core.Author')),
            ],
        ),
        migrations.CreateModel(
            name='BookBatch',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event', models.CharField(max_length=64)),
                ('country', models.CharField(max_length=64)),
                ('location', djgeojson.fields.PointField()),
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
                ('time', models.DateTimeField()),
                ('message', models.CharField(max_length=512)),
                ('location', djgeojson.fields.PointField()),
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
            ],
        ),
        migrations.CreateModel(
            name='BookOwning',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('time', models.DateTimeField()),
                ('message', models.CharField(max_length=512)),
                ('location', djgeojson.fields.PointField()),
                ('book_instance', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.BookInstance')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='bookholding',
            name='book_instance',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.BookInstance'),
        ),
        migrations.AddField(
            model_name='bookholding',
            name='holder',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
