-- FluentMate · Seed starter vocabulary for every user
-- Adds ~12 useful phrases per user when they're created.
-- Re-runnable: existing users get the seed only if they have no vocab yet.

create or replace function public.seed_starter_vocabulary(uid uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  -- Skip if user already has vocab (avoid duplicates on re-run / re-trigger).
  if exists (select 1 from public.vocabulary where user_id = uid limit 1) then
    return;
  end if;

  insert into public.vocabulary
    (user_id, english, vietnamese, ipa, context_sentence, next_review_at)
  values
    (uid, 'I appreciate your help',                'Cảm ơn bạn đã giúp',                '/aɪ əˈpriːʃieɪt jɔːr help/',                  'I appreciate your help with the report.',           current_date),
    (uid, 'Could you walk me through it?',         'Bạn giải thích lại được không?',    '/kʊd juː wɔːk miː θruː ɪt/',                  'Could you walk me through it again?',               current_date),
    (uid, 'Let me get back to you',                'Để tôi phản hồi sau',               '/lɛt miː ɡɛt bæk tə juː/',                    'Let me get back to you on that tomorrow.',          current_date),
    (uid, 'I''m on the same page',                 'Tôi cũng nghĩ vậy',                 '/aɪm ɒn ðə seɪm peɪdʒ/',                      'Sounds great — I''m on the same page.',             current_date),
    (uid, 'break the ice',                         'phá vỡ sự ngại ngùng',              '/breɪk ðiː aɪs/',                             'A small joke can break the ice.',                   current_date),
    (uid, 'on top of that',                        'thêm vào đó',                       '/ɒn tɒp əv ðæt/',                             'It''s late — on top of that, I''m exhausted.',      current_date),
    (uid, 'I''d like a window seat',               'Tôi muốn ghế cạnh cửa sổ',          '/aɪd laɪk ə ˈwɪndoʊ siːt/',                   'I''d like a window seat, please.',                  current_date),
    (uid, 'Can I get a latte?',                    'Cho tôi một ly latte',              '/kæn aɪ ɡɛt ə ˈlɑːteɪ/',                      'Can I get a latte to go?',                          current_date),
    (uid, 'Sorry, I missed that',                  'Xin lỗi, tôi không nghe rõ',        '/ˈsɒri aɪ mɪst ðæt/',                         'Sorry, I missed that — could you repeat?',          current_date),
    (uid, 'It depends on the situation',           'Còn tuỳ vào tình huống',            '/ɪt dɪˈpɛndz ɒn ðə ˌsɪtʃuˈeɪʃən/',            'It depends on the situation, honestly.',            current_date),
    (uid, 'Let''s circle back later',              'Mình sẽ quay lại chuyện đó sau',    '/lɛts ˈsɜːrkəl bæk ˈleɪtər/',                 'Good point — let''s circle back later.',            current_date + interval '1 day'),
    (uid, 'I''ll keep that in mind',               'Tôi sẽ ghi nhớ',                    '/aɪl kiːp ðæt ɪn maɪnd/',                     'Thanks for the tip — I''ll keep that in mind.',     current_date + interval '1 day');
end; $$;

-- Trigger: seed vocab whenever a row in public.users is created
create or replace function public.trigger_seed_vocabulary()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.seed_starter_vocabulary(new.id);
  return new;
end; $$;

drop trigger if exists seed_vocabulary_on_user_insert on public.users;
create trigger seed_vocabulary_on_user_insert
  after insert on public.users
  for each row execute procedure public.trigger_seed_vocabulary();

-- Retroactive: seed for all existing users that have no vocab.
do $$
declare
  u record;
begin
  for u in select id from public.users loop
    perform public.seed_starter_vocabulary(u.id);
  end loop;
end $$;
