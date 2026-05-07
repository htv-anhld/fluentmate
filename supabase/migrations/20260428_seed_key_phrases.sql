-- FluentMate · Seed key_phrases for the remaining 4 scenarios.
-- Re-runnable.

delete from public.key_phrases
where scenario_id in (
  select id from public.scenarios
  where title in (
    'Make a restaurant reservation',
    'Tell me about yourself',
    'At the doctor',
    'Pitch your idea'
  )
);

insert into public.key_phrases (scenario_id, english, vietnamese, ipa, sort_order)
select s.id, p.english, p.vietnamese, p.ipa, p.sort_order
from public.scenarios s
join (values
  -- Restaurant reservation
  ('Make a restaurant reservation', 'I''d like to book a table for two',  'Tôi muốn đặt bàn cho hai người',         '/aɪd laɪk tə bʊk ə ˈteɪbəl fɔːr tuː/',         0),
  ('Make a restaurant reservation', 'Around 7pm, please',                  'Khoảng 7 giờ tối ạ',                     '/əˈraʊnd ˈsɛvən piː ɛm pliːz/',                1),
  ('Make a restaurant reservation', 'Do you have vegetarian options?',     'Bên bạn có đồ chay không?',              '/duː juː hæv ˌvɛdʒəˈtɛəriən ˈɒpʃənz/',         2),
  ('Make a restaurant reservation', 'A quiet table would be nice',          'Bàn yên tĩnh thì tốt quá',              '/ə ˈkwaɪət ˈteɪbəl wʊd biː naɪs/',             3),

  -- Job interview
  ('Tell me about yourself',        'I have five years of experience in...', 'Tôi có 5 năm kinh nghiệm về...',       '/aɪ hæv faɪv jɪərz əv ɪkˈspɪəriəns ɪn/',       0),
  ('Tell me about yourself',        'My biggest strength is...',           'Điểm mạnh nhất của tôi là...',           '/maɪ ˈbɪɡɪst strɛŋθ ɪz/',                      1),
  ('Tell me about yourself',        'I''m drawn to this role because...',  'Tôi quan tâm vai trò này vì...',         '/aɪm drɔːn tə ðɪs roʊl bɪˈkɒz/',               2),
  ('Tell me about yourself',        'In five years I see myself...',       'Trong 5 năm tới tôi thấy mình...',       '/ɪn faɪv jɪərz aɪ siː maɪˈsɛlf/',              3),

  -- Doctor visit
  ('At the doctor',                 'I''ve had a sore throat for...',      'Tôi bị đau họng được...',                '/aɪv hæd ə sɔːr θroʊt fɔːr/',                  0),
  ('At the doctor',                 'On a scale of one to ten...',         'Theo thang điểm 1-10...',                '/ɒn ə skeɪl əv wʌn tə tɛn/',                   1),
  ('At the doctor',                 'I''m allergic to...',                  'Tôi dị ứng với...',                     '/aɪm əˈlɜːrdʒɪk tə/',                          2),
  ('At the doctor',                 'How often should I take this?',       'Tôi uống thuốc này mấy lần một ngày?',   '/haʊ ˈɒfən ʃʊd aɪ teɪk ðɪs/',                  3),

  -- Pitch presentation
  ('Pitch your idea',               'Today I''d like to introduce...',     'Hôm nay tôi muốn giới thiệu...',         '/təˈdeɪ aɪd laɪk tə ˌɪntrəˈdjuːs/',            0),
  ('Pitch your idea',               'The problem we''re solving is...',    'Vấn đề mình giải quyết là...',           '/ðə ˈprɒbləm wɪər ˈsɒlvɪŋ ɪz/',                1),
  ('Pitch your idea',               'Our go-to-market is...',              'Chiến lược ra mắt của mình là...',       '/aʊər ɡoʊ tə ˈmɑːrkɪt ɪz/',                    2),
  ('Pitch your idea',               'We''re raising X to scale to Y',      'Mình gọi X vốn để đạt Y',               '/wɪər ˈreɪzɪŋ/',                               3)
) as p(scenario_title, english, vietnamese, ipa, sort_order)
  on s.title = p.scenario_title;
