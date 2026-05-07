-- FluentMate · Additional seed data
-- Adds key_phrases for the 8 starter scenarios and 1 sample grammar lesson.
-- Safe to re-run.

-- ──────────────────────────────────────────────────────────
-- KEY PHRASES — populate via lookup by scenario title
-- ──────────────────────────────────────────────────────────

-- Wipe existing key_phrases for the seeded scenarios so we don't accumulate dupes
delete from public.key_phrases
where scenario_id in (
  select id from public.scenarios
  where title in (
    'Order coffee at a café',
    'Daily standup',
    'Check-in at the airport',
    'Meet a new colleague'
  )
);

insert into public.key_phrases (scenario_id, english, vietnamese, ipa, sort_order)
select s.id, p.english, p.vietnamese, p.ipa, p.sort_order
from public.scenarios s
join (values
  ('Order coffee at a café', 'Can I get a latte?',          'Cho tôi một ly latte',           '/kæn aɪ ɡɛt ə ˈlɑːteɪ/',     0),
  ('Order coffee at a café', 'For here or to go?',          'Uống tại quán hay mang đi?',     '/fɔːr hɪər ɔːr tə ɡoʊ/',      1),
  ('Order coffee at a café', 'Could I get an extra shot?',  'Cho tôi thêm một shot espresso', '/kʊd aɪ ɡɛt ən ˈɛkstrə ʃɒt/', 2),

  ('Daily standup',          'Yesterday I worked on...',    'Hôm qua tôi làm về...',          '/ˈjɛstərdeɪ aɪ wɜːrkt ɒn/',   0),
  ('Daily standup',          'I''m blocked on...',          'Tôi đang vướng ở...',            '/aɪm blɒkt ɒn/',              1),
  ('Daily standup',          'Today I plan to ship...',     'Hôm nay tôi sẽ ship...',         '/təˈdeɪ aɪ plæn tə ʃɪp/',     2),

  ('Check-in at the airport','I''d like a window seat',     'Tôi muốn ghế cạnh cửa sổ',       '/aɪd laɪk ə ˈwɪndoʊ siːt/',   0),
  ('Check-in at the airport','I have one bag to check',     'Tôi có một vali ký gửi',         '/aɪ hæv wʌn bæɡ tə tʃɛk/',    1),
  ('Check-in at the airport','Which gate?',                 'Cổng nào ạ?',                    '/wɪtʃ ɡeɪt/',                 2),

  ('Meet a new colleague',   'Nice to meet you',            'Rất vui được gặp bạn',           '/naɪs tə miːt juː/',          0),
  ('Meet a new colleague',   'What team are you on?',       'Bạn ở team nào?',                '/wʌt tiːm ɑːr juː ɒn/',       1),
  ('Meet a new colleague',   'How long have you been here?','Bạn làm ở đây bao lâu rồi?',     '/haʊ lɔːŋ hæv juː bɪn hɪər/', 2)
) as p(scenario_title, english, vietnamese, ipa, sort_order)
  on s.title = p.scenario_title;

-- ──────────────────────────────────────────────────────────
-- GRAMMAR LESSON — Present Perfect (sample)
-- ──────────────────────────────────────────────────────────
insert into public.grammar_lessons (
  title, title_vi, level, sort_order, hook_dialog, rule_content, exercises
)
select
  'Present Perfect',
  'Thì hiện tại hoàn thành',
  'A2',
  1,
  jsonb_build_array(
    jsonb_build_object('role', 'ai',   'text', 'Have you ever been to Da Nang?'),
    jsonb_build_object('role', 'user', 'text', 'Yes, I have. I went last summer.')
  ),
  jsonb_build_object(
    'summary', 'Present perfect = "have/has + past participle" — kết nối quá khứ với hiện tại.',
    'forms', jsonb_build_array(
      jsonb_build_object('subject', 'I/you/we/they', 'aux', 'have', 'example', 'I have lived here for 3 years.'),
      jsonb_build_object('subject', 'he/she/it',     'aux', 'has',  'example', 'She has finished her homework.')
    ),
    'usage', jsonb_build_array(
      'Trải nghiệm: I have been to Japan.',
      'Hành động vừa xong: She has just left.',
      'Khoảng thời gian chưa kết thúc: We have lived here since 2020.'
    )
  ),
  jsonb_build_array(
    jsonb_build_object(
      'type', 'fill-blank',
      'prompt', 'I ___ (visit) Hanoi twice.',
      'answer', 'have visited',
      'explanation', 'Twice = số lần → present perfect.'
    ),
    jsonb_build_object(
      'type', 'multiple-choice',
      'prompt', 'She ___ never ___ Italian food.',
      'options', jsonb_build_array('have/tried', 'has/tried', 'have/tries', 'has/trying'),
      'answer', 'has/tried',
      'explanation', 'Ngôi 3 số ít → has + past participle.'
    ),
    jsonb_build_object(
      'type', 'translation',
      'prompt', 'Tôi đã sống ở đây từ năm 2020.',
      'answer', 'I have lived here since 2020.',
      'explanation', 'Khoảng thời gian chưa kết thúc dùng since.'
    )
  )
where not exists (
  select 1 from public.grammar_lessons where title = 'Present Perfect'
);
