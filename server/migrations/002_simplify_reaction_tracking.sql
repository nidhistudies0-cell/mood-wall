ALTER TABLE note_reactions DROP CONSTRAINT note_reactions_pkey;
ALTER TABLE note_reactions ADD CONSTRAINT note_reactions_pkey PRIMARY KEY (user_key);