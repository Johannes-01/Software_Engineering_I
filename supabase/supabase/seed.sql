INSERT INTO auth.users (instance_id,
                        id,
                        aud,
                        role,
                        email,
                        encrypted_password,
                        email_confirmed_at,
                        recovery_sent_at,
                        last_sign_in_at,
                        raw_app_meta_data,
                        raw_user_meta_data,
                        created_at,
                        updated_at,
                        confirmation_token,
                        email_change,
                        email_change_token_new,
                        recovery_token)
values ('00000000-0000-0000-0000-000000000000',
        '5f2550bc-ba48-45d0-8e01-de7a2ca246c2',
        'authenticated',
        'authenticated',
        'user1@example.com',
        crypt('asdfasdf', gen_salt('bf')),
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}',
        '{}',
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        ''),
       ('00000000-0000-0000-0000-000000000000',
        uuid_generate_v4(),
        'authenticated',
        'authenticated',
        'user2@example.com',
        crypt('asdfasdf', gen_salt('bf')),
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}',
        '{}',
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        '');

-- test user email identities
INSERT INTO auth.identities (id,
                             user_id,
                             identity_data,
                             provider,
                             provider_id,
                             last_sign_in_at,
                             created_at,
                             updated_at) (select uuid_generate_v4(),
                                                 id,
                                                 format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb, 'email',
                                                 id,
                                                 current_timestamp,
                                                 current_timestamp,
                                                 current_timestamp
                                          from auth.users);


insert into public.category (name)
values ('Original'),
       ('Reproduktion'),
       ('Grafiken');

insert into public.topic_folder
    (name, description)
values ('Van Gogh', 'Sammlung von allen Van Gogh Bildern'),
       ('Lieblinsbilder', null);

insert into public.image
(category_id, title, artist, motive_height, motive_width, height, width, price, notice, image_id)
values (2, 'Sternennacht', 'Vincent van Gogh', 40, 30, 40, 30, 150000000,
        'Sternennacht ist eines der bekanntesten Gemälde des niederländischen Künstlers Vincent van Gogh.',
        '4401685e-9a79-4921-9178-44c7147f0dc1'),
       (1, 'Mona Lisa', 'Leonardo da Vinci', 40, 30, 40, 30, 50000000000,
        'Mona Lisa ist ein weltberühmtes Ölgemälde von Leonardo da Vinci aus der Hochphase der italienischen Renaissance Anfang des 16. Jahrhunderts.',
        'fb20d7db-d117-408c-838c-948f0f249434'),
       (3, 'Der Schrei', 'Edvard Munch', 91, 73, 93, 75, 120000000,
        'Eines der ausdrucksstärksten Werke des Expressionismus, das die Angst und Verzweiflung des modernen Menschen darstellt. Es gibt mehrere Versionen dieses Werkes, das Original ist in Oslo zu sehen.',
        '82818212-fdb4-4f44-bec4-84cdf5c280d0'),
       (3, 'Die Geburt der Venus', 'Sandro Botticelli', 172, 278, 175, 280, 200000000,
        'Ein Meisterwerk der italienischen Renaissance, das die Geburt der Göttin Venus zeigt. Die Komposition und Farbgebung machen es zu einem der wertvollsten Schätze der Uffizien in Florenz.',
        '2f081935-5d71-4ac3-8765-0b3890f12dbd'),
       (3, 'Guernica', 'Pablo Picasso', 349, 776, 350, 780, 50000000000,
        'Picassos berühmtes Antikriegsgemälde, das die Schrecken des Bombenangriffs auf Guernica darstellt. Es ist ein Monumentalwerk des Kubismus und im Reina Sofia Museum in Madrid ausgestellt.',
        '45c5fff9-1239-4e76-b1c2-0fca59541675');

insert into public.image_to_topic_folder
    (image_id, topic_folder_id)
values (1, 1),
       (2, 2),
       (2, 1);

insert into public.selection
    (pallet, strip, customer_id, image_id, passepartout, is_recommendation)
values ('dark brown', 'gold 30cm', '5f2550bc-ba48-45d0-8e01-de7a2ca246c2', 1, false, false),
       (null, null, '5f2550bc-ba48-45d0-8e01-de7a2ca246c2', 2, false, true);

