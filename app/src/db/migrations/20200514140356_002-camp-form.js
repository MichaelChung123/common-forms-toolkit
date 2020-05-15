exports.up = function(knex) {
  return Promise.resolve()
    .then(() => knex.schema.createTable('camp_form', table => {
      table.uuid('formId').references('formId').inTable('form').notNullable().primary();
      table.string('description');
      table.string('createdBy');
      table.timestamp('createdAt', { useTz: true }).defaultTo(knex.fn.now());
      table.string('updatedBy');
      table.timestamp('updatedAt', { useTz: true }).defaultTo(knex.fn.now());
      table.comment('There should only be one record in this table.  It is the Industrial Camp instance of form');
    }))
    .then(() => knex.schema.createTable('camp_form_version', table => {
      table.increments('formVersionId').primary();
      table.uuid('formId').references('formId').inTable('form').notNullable().index();
      table.string('changes').comment('Document the changes in this version');
      table.string('createdBy');
      table.timestamp('createdAt', { useTz: true }).defaultTo(knex.fn.now());
      table.string('updatedBy');
      table.timestamp('updatedAt', { useTz: true }).defaultTo(knex.fn.now());
    }))
    .then(() => knex.schema.createTable('camp_status_code', table => {
      table.string('code').primary();
      table.integer('formVersionId').references('formVersionId').inTable('camp_form_version').notNullable().index();
      table.string('display').notNullable();
      table.boolean('enabled').notNullable().defaultTo(true);
      table.specificType('nextCodes', 'text ARRAY').comment('This is an array of codes that this status could transition to next');
      table.string('createdBy');
      table.timestamp('createdAt', { useTz: true }).defaultTo(knex.fn.now());
      table.string('updatedBy');
      table.timestamp('updatedAt', { useTz: true }).defaultTo(knex.fn.now());
    }))
    .then(() => knex.schema.createTable('camp_submission', table => {
      table.uuid('submissionId').primary();
      table.integer('formVersionId').references('formVersionId').inTable('camp_form_version').notNullable().index();
      table.string('confirmationId').notNullable().unique().index();
      table.timestamp('createdAt', { useTz: true }).defaultTo(knex.fn.now());
      table.string('updatedBy');
      table.timestamp('updatedAt', { useTz: true }).defaultTo(knex.fn.now());
    }))
    .then(() => knex.schema.createTable('camp_submission_status', table => {
      table.increments('submissionStatusId').primary();
      table.uuid('submissionId').references('submissionId').inTable('camp_submission').notNullable().index();
      table.string('code').references('code').inTable('camp_status_code').notNullable().index();
      table.string('assignedTo');
      table.string('createdBy');
      table.timestamp('createdAt', { useTz: true }).defaultTo(knex.fn.now());
      table.string('updatedBy');
      table.timestamp('updatedAt', { useTz: true }).defaultTo(knex.fn.now());
    }))
    .then(() => knex.schema.createTable('camp_notes', table => {
      table.increments('noteId').primary();
      table.uuid('submissionId').references('submissionId').inTable('camp_submission').index();
      table.integer('submissionStatusId').references('submissionStatusId').inTable('camp_submission_status').index();
      table.string('note', 4000).nullable();
      table.string('createdBy');
      table.timestamp('createdAt', { useTz: true }).defaultTo(knex.fn.now());
      table.string('updatedBy');
      table.timestamp('updatedAt', { useTz: true }).defaultTo(knex.fn.now());
    }));
};

exports.down = function(knex) {
  return Promise.resolve()
    .then(() => knex.schema.dropTableIfExists('camp_notes'))
    .then(() => knex.schema.dropTableIfExists('camp_submission_status'))
    .then(() => knex.schema.dropTableIfExists('camp_submission'))
    .then(() => knex.schema.dropTableIfExists('camp_status_code'))
    .then(() => knex.schema.dropTableIfExists('camp_form_version'))
    .then(() => knex.schema.dropTableIfExists('camp_form'));
};
