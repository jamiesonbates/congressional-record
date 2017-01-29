'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('floor_speeches', (table) => {
    table.increments();
    table.text('publication_title');
    table.text('title');
    table.text('speaker');
    table.text('date');
    table.text('time');
    table.text('page_number_range');
    table.text('congressional_body');
    table.text('congress');
    table.text('speech_text');
    table.text('text_url');
    table.text('pdf_url');
    table.text('mods_url');
    table.text('collection_category');
    table.text('collection');
    table.text('sudoc_class_number');
    table.text('publisher');
    table.text('sub_type');
  });
}

exports.down = function(knex) {
  return knex.schema.dropTable('floor_speeches');
}
