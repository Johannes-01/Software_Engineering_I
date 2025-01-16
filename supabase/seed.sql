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
        '{"role": "admin"}',
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
(category_id, title, artist, motive_height, motive_width, height, width, price, notice, image_path)
values (2, 'Sternennacht', 'Vincent van Gogh', 40, 30, 40, 30, 150000000,
        'Sternennacht ist eines der bekanntesten Gemälde des niederländischen Künstlers Vincent van Gogh.',
        '8fc7c988-8be2-4e7b-bca2-ba6576cb0f05.jpg'),
       (1, 'Mona Lisa', 'Leonardo da Vinci', 40, 30, 40, 30, 50000000000,
        'Mona Lisa ist ein weltberühmtes Ölgemälde von Leonardo da Vinci aus der Hochphase der italienischen Renaissance Anfang des 16. Jahrhunderts.',
        'ac0637d8-c951-4444-9399-5fe32754f690.webp'),
       (3, 'Der Schrei', 'Edvard Munch', 91, 73, 93, 75, 120000000,
        'Eines der ausdrucksstärksten Werke des Expressionismus, das die Angst und Verzweiflung des modernen Menschen darstellt. Es gibt mehrere Versionen dieses Werkes, das Original ist in Oslo zu sehen.',
        '7e628ae4-ce6c-47a6-8202-08f51ff890bb.jpg'),
       (3, 'Die Geburt der Venus', 'Sandro Botticelli', 172, 278, 175, 280, 200000000,
        'Ein Meisterwerk der italienischen Renaissance, das die Geburt der Göttin Venus zeigt. Die Komposition und Farbgebung machen es zu einem der wertvollsten Schätze der Uffizien in Florenz.',
        '53992b42-d551-4a1e-ac13-bd9fde1bde56.webp'),
       (3, 'Guernica', 'Pablo Picasso', 349, 776, 350, 780, 50000000000,
        'Picassos berühmtes Antikriegsgemälde, das die Schrecken des Bombenangriffs auf Guernica darstellt. Es ist ein Monumentalwerk des Kubismus und im Reina Sofia Museum in Madrid ausgestellt.',
        '3795cf0d-4a19-49e2-8799-f0a124f9abbc.jpg');

insert into public.image_to_topic_folder
    (image_id, topic_folder_id)
values (1, 1),
       (2, 2),
       (2, 1);

insert into public.selection
    (pallet, strip, customer_id, image_id, passepartout, is_recommendation)
values ('dark brown', 'gold 30cm', '5f2550bc-ba48-45d0-8e01-de7a2ca246c2', 1, false, false),
       (null, null, '5f2550bc-ba48-45d0-8e01-de7a2ca246c2', 2, false, true);

insert into storage.buckets
    (id, name, created_at, updated_at, public, avif_autodetection, allowed_mime_types)
values ('images', 'images', current_timestamp, current_timestamp, TRUE, FALSE, ARRAY['image/*']);

CREATE POLICY "Enable insert for authenticated users only" ON "storage"."buckets"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true)