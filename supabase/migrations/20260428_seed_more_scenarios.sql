-- Add ~20 more scenarios across all 6 categories so the Learn screen has variety.
-- Idempotent: matches by title to avoid duplicating on re-run.
-- Each scenario gets 3 key phrases (en/vi/ipa) inserted only if the scenario
-- was newly created (so we don't duplicate phrases for existing rows).

WITH new_scenarios (title, title_vi, category, level, duration_min, goal, icon_emoji) AS (
  VALUES
    -- ── Workplace (extend) ─────────────────────────────────
    ('Reply to a tricky email', 'Trả lời email khó', 'workplace', 'B1', 8, 'Reply to a vague client email politely and clearly', '📧'),
    ('Negotiate your salary', 'Đàm phán lương', 'workplace', 'B2', 10, 'Ask for a raise with confidence and data', '💰'),
    ('Disagree in a meeting', 'Phản biện trong họp', 'workplace', 'B2', 8, 'Push back on an idea without sounding rude', '🗣️'),
    ('Performance review check-in', 'Đánh giá công việc 1-1', 'workplace', 'B1', 10, 'Talk about wins, blockers, and goals with your manager', '📋'),

    -- ── Survival (extend) ──────────────────────────────────
    ('Grocery shopping', 'Đi siêu thị', 'survival', 'A1', 5, 'Find items, ask for help, pay at the register', '🛒'),
    ('At the pharmacy', 'Mua thuốc ở hiệu thuốc', 'survival', 'A2', 5, 'Describe symptoms and buy medicine', '💊'),
    ('Get a haircut', 'Đi cắt tóc', 'survival', 'A2', 6, 'Describe the cut you want and chat with the stylist', '💇'),
    ('Apartment hunting', 'Tìm nhà thuê', 'survival', 'B1', 8, 'Tour an apartment and ask about utilities, deposit', '🏠'),

    -- ── Social (extend) ────────────────────────────────────
    ('Coffee with a friend', 'Cà phê với bạn', 'social', 'A2', 6, 'Catch up casually, share recent news', '☕'),
    ('Birthday party small talk', 'Tán gẫu tiệc sinh nhật', 'social', 'A2', 6, 'Mingle, give compliments, find common topics', '🎂'),
    ('Apologize sincerely', 'Xin lỗi chân thành', 'social', 'B1', 5, 'Apologize for being late or making a mistake', '🙏'),
    ('Networking event', 'Sự kiện networking', 'social', 'B1', 8, 'Introduce yourself, exchange contacts, follow up', '🤝'),

    -- ── Travel (extend) ────────────────────────────────────
    ('Hotel check-in', 'Nhận phòng khách sạn', 'travel', 'A2', 5, 'Confirm reservation, ask about facilities', '🏨'),
    ('Ask for directions', 'Hỏi đường', 'travel', 'A1', 4, 'Ask how to get somewhere on foot or by transit', '🗺️'),
    ('Lost luggage at the airport', 'Mất hành lý sân bay', 'travel', 'B1', 7, 'File a report, describe your bag, give contact info', '🧳'),
    ('Take a taxi', 'Đi taxi', 'travel', 'A1', 4, 'Tell the driver where to go and confirm the fare', '🚕'),

    -- ── Academic (new) ─────────────────────────────────────
    ('Office hours with the professor', 'Gặp giảng viên giờ tư vấn', 'academic', 'B1', 8, 'Ask about an assignment or unclear concept', '👩‍🏫'),
    ('Group project planning', 'Họp dự án nhóm', 'academic', 'B1', 8, 'Split tasks, set deadlines with classmates', '📚'),
    ('Class presentation Q&A', 'Hỏi đáp sau thuyết trình', 'academic', 'B2', 8, 'Handle audience questions confidently', '🎤'),
    ('Library help', 'Nhờ thủ thư hỗ trợ', 'academic', 'A2', 4, 'Find a book, request an extension, use facilities', '📖'),

    -- ── Industry (new) ─────────────────────────────────────
    ('Tech bug triage', 'Phân loại bug kỹ thuật', 'industry', 'B1', 8, 'Describe a reproduction, severity, and impact', '🐛'),
    ('Customer support call', 'Gọi hỗ trợ khách hàng', 'industry', 'B1', 7, 'Calm down a frustrated customer and offer a fix', '📞'),
    ('Pitch to a client', 'Chào hàng với khách', 'industry', 'B2', 9, 'Present a product, handle objections, close the deal', '💼'),
    ('Hospital admission', 'Nhập viện', 'industry', 'B1', 7, 'Explain symptoms and history at hospital reception', '🏥')
),
inserted AS (
  INSERT INTO public.scenarios (title, title_vi, category, level, duration_min, goal, system_prompt, icon_emoji, is_generated)
  SELECT n.title, n.title_vi, n.category, n.level, n.duration_min, n.goal, '', n.icon_emoji, false
  FROM new_scenarios n
  WHERE NOT EXISTS (
    SELECT 1 FROM public.scenarios s WHERE s.title = n.title
  )
  RETURNING id, title
)
INSERT INTO public.key_phrases (scenario_id, english, vietnamese, ipa, sort_order)
SELECT i.id, kp.english, kp.vietnamese, kp.ipa, kp.sort_order
FROM inserted i
JOIN (VALUES
  -- Workplace
  ('Reply to a tricky email', 'Thanks for reaching out, let me look into this', 'Cảm ơn bạn đã liên hệ, để tôi xem qua', '/θæŋks fɔːr ˈriːtʃɪŋ aʊt/', 1),
  ('Reply to a tricky email', 'Could you clarify what you mean?', 'Bạn có thể nói rõ hơn không?', '/kʊd ju ˈklær.ə.faɪ wɒt ju miːn/', 2),
  ('Reply to a tricky email', 'I will get back to you by EOD', 'Tôi sẽ trả lời bạn cuối ngày', '/aɪ wɪl ɡɛt bæk tu ju baɪ iː oʊ diː/', 3),

  ('Negotiate your salary', 'Based on my contributions, I was hoping for...', 'Dựa trên đóng góp của tôi, tôi mong muốn mức...', '/beɪst ɒn maɪ ˌkɒntrɪˈbjuːʃənz/', 1),
  ('Negotiate your salary', 'Is there room to discuss the offer?', 'Có thể thương lượng đề nghị này không?', '/ɪz ðɛr ruːm tə dɪˈskʌs ði ˈɒfər/', 2),
  ('Negotiate your salary', 'I would like to revisit the package', 'Tôi muốn xem lại gói lương', '/aɪ wʊd laɪk tu ˌriːˈvɪzɪt ðə ˈpækɪdʒ/', 3),

  ('Disagree in a meeting', 'I see your point, but I would push back on...', 'Tôi hiểu ý bạn, nhưng tôi muốn phản biện...', '/aɪ siː jɔːr pɔɪnt/', 1),
  ('Disagree in a meeting', 'Have we considered the trade-off here?', 'Chúng ta đã cân nhắc đánh đổi chưa?', '/hæv wi kənˈsɪdəd ðə treɪd ɒf/', 2),
  ('Disagree in a meeting', 'Let me play devil''s advocate', 'Để tôi đứng góc đối lập một chút', '/lɛt mi pleɪ ˈdɛvəlz ˈædvəkət/', 3),

  ('Performance review check-in', 'My biggest win this quarter was...', 'Thành công lớn nhất của tôi quý này là...', '/maɪ ˈbɪɡəst wɪn ðɪs ˈkwɔːrtər/', 1),
  ('Performance review check-in', 'I would appreciate feedback on...', 'Tôi muốn xin phản hồi về...', '/aɪ wʊd əˈpriːʃieɪt ˈfiːdbæk ɒn/', 2),
  ('Performance review check-in', 'My next goal is to...', 'Mục tiêu tiếp theo của tôi là...', '/maɪ nɛkst ɡoʊl ɪz tu/', 3),

  -- Survival
  ('Grocery shopping', 'Excuse me, where can I find...?', 'Xin lỗi, ở đâu có...?', '/ɪkˈskjuːz miː/', 1),
  ('Grocery shopping', 'Do you have this in a smaller size?', 'Có loại nhỏ hơn không?', '/duː ju hæv ðɪs ɪn ə ˈsmɔːlər saɪz/', 2),
  ('Grocery shopping', 'Can I pay by card?', 'Tôi quẹt thẻ được không?', '/kæn aɪ peɪ baɪ kɑːrd/', 3),

  ('At the pharmacy', 'I have a sore throat and a runny nose', 'Tôi bị đau họng và sổ mũi', '/aɪ hæv ə sɔːr θroʊt/', 1),
  ('At the pharmacy', 'Is this over the counter?', 'Thuốc này không cần đơn phải không?', '/ɪz ðɪs ˈoʊvər ðə ˈkaʊntər/', 2),
  ('At the pharmacy', 'Any side effects I should know?', 'Có tác dụng phụ gì không?', '/ˈɛni saɪd ɪˈfɛkts/', 3),

  ('Get a haircut', 'Just a trim, please', 'Chỉ tỉa nhẹ thôi', '/dʒʌst ə trɪm pliːz/', 1),
  ('Get a haircut', 'Take about an inch off the sides', 'Cắt ngắn hai bên khoảng 2.5cm', '/teɪk əˈbaʊt ən ɪntʃ ɒf ðə saɪdz/', 2),
  ('Get a haircut', 'Could you blow-dry it?', 'Bạn sấy giúp tôi nhé?', '/kʊd ju bloʊ draɪ ɪt/', 3),

  ('Apartment hunting', 'Are utilities included?', 'Tiền điện nước có bao gồm không?', '/ɑːr juːˈtɪlətiz ɪnˈkluːdɪd/', 1),
  ('Apartment hunting', 'How much is the deposit?', 'Tiền cọc bao nhiêu?', '/haʊ mʌtʃ ɪz ðə dɪˈpɒzɪt/', 2),
  ('Apartment hunting', 'When can I move in?', 'Khi nào tôi vào ở được?', '/wɛn kæn aɪ muːv ɪn/', 3),

  -- Social
  ('Coffee with a friend', 'It''s been ages! How have you been?', 'Lâu lắm rồi! Dạo này thế nào?', '/ɪts biːn ˈeɪdʒɪz/', 1),
  ('Coffee with a friend', 'Tell me everything', 'Kể tôi nghe đi', '/tɛl miː ˈɛvriθɪŋ/', 2),
  ('Coffee with a friend', 'We should do this more often', 'Mình nên gặp nhau thường hơn', '/wi ʃʊd duː ðɪs mɔːr ˈɒfən/', 3),

  ('Birthday party small talk', 'Happy birthday! Thanks for inviting me', 'Sinh nhật vui vẻ! Cảm ơn vì đã mời', '/ˈhæpi ˈbɜːrθdeɪ/', 1),
  ('Birthday party small talk', 'How do you know the birthday person?', 'Bạn quen chủ nhân bữa tiệc thế nào?', '/haʊ duː ju noʊ ðə ˈbɜːrθdeɪ ˈpɜːrsən/', 2),
  ('Birthday party small talk', 'The cake looks amazing', 'Bánh nhìn ngon thật', '/ðə keɪk lʊks əˈmeɪzɪŋ/', 3),

  ('Apologize sincerely', 'I''m really sorry, that was on me', 'Tôi xin lỗi, đó là lỗi của tôi', '/aɪm ˈrɪəli ˈsɒri/', 1),
  ('Apologize sincerely', 'I should have let you know earlier', 'Tôi nên báo bạn sớm hơn', '/aɪ ʃʊd hæv lɛt ju noʊ ˈɜːrlɪər/', 2),
  ('Apologize sincerely', 'How can I make it up to you?', 'Tôi bù đắp thế nào được?', '/haʊ kæn aɪ meɪk ɪt ʌp tu ju/', 3),

  ('Networking event', 'What brings you here today?', 'Hôm nay gì mang bạn tới đây?', '/wɒt brɪŋz ju hɪər təˈdeɪ/', 1),
  ('Networking event', 'I would love to stay in touch', 'Mình muốn giữ liên lạc', '/aɪ wʊd lʌv tu steɪ ɪn tʌtʃ/', 2),
  ('Networking event', 'Do you have a card?', 'Bạn có name card không?', '/duː ju hæv ə kɑːrd/', 3),

  -- Travel
  ('Hotel check-in', 'I have a reservation under...', 'Tôi đã đặt phòng dưới tên...', '/aɪ hæv ə ˌrɛzərˈveɪʃən/', 1),
  ('Hotel check-in', 'What time is breakfast?', 'Mấy giờ ăn sáng?', '/wɒt taɪm ɪz ˈbrɛkfəst/', 2),
  ('Hotel check-in', 'Could I get a wake-up call?', 'Bạn có thể gọi tôi dậy không?', '/kʊd aɪ ɡɛt ə weɪk ʌp kɔːl/', 3),

  ('Ask for directions', 'How do I get to...?', 'Làm sao tới được...?', '/haʊ duː aɪ ɡɛt tu/', 1),
  ('Ask for directions', 'Is it within walking distance?', 'Đi bộ tới được không?', '/ɪz ɪt wɪˈðɪn ˈwɔːkɪŋ ˈdɪstəns/', 2),
  ('Ask for directions', 'Which way is north?', 'Hướng nào là hướng bắc?', '/wɪtʃ weɪ ɪz nɔːrθ/', 3),

  ('Lost luggage at the airport', 'My bag did not arrive', 'Hành lý của tôi không tới', '/maɪ bæɡ dɪd nɒt əˈraɪv/', 1),
  ('Lost luggage at the airport', 'Here is my baggage claim ticket', 'Đây là vé hành lý của tôi', '/hɪər ɪz maɪ ˈbæɡɪdʒ kleɪm ˈtɪkɪt/', 2),
  ('Lost luggage at the airport', 'How can I follow up?', 'Tôi theo dõi tình trạng thế nào?', '/haʊ kæn aɪ ˈfɒloʊ ʌp/', 3),

  ('Take a taxi', 'Take me to this address please', 'Cho tôi tới địa chỉ này', '/teɪk miː tu ðɪs əˈdrɛs/', 1),
  ('Take a taxi', 'How much will it cost?', 'Bao nhiêu tiền vậy?', '/haʊ mʌtʃ wɪl ɪt kɒst/', 2),
  ('Take a taxi', 'Could you turn on the meter?', 'Bạn bật đồng hồ giúp tôi nhé?', '/kʊd ju tɜːrn ɒn ðə ˈmiːtər/', 3),

  -- Academic
  ('Office hours with the professor', 'Could I ask about question 3?', 'Tôi hỏi về câu 3 được không?', '/kʊd aɪ æsk əˈbaʊt ˈkwɛstʃən θriː/', 1),
  ('Office hours with the professor', 'I am stuck on this concept', 'Tôi đang bí ở khái niệm này', '/aɪ æm stʌk ɒn ðɪs ˈkɒnsɛpt/', 2),
  ('Office hours with the professor', 'Could you point me to a resource?', 'Bạn chỉ tôi tài liệu nào tham khảo nhé?', '/kʊd ju pɔɪnt miː tu ə ˈriːsɔːrs/', 3),

  ('Group project planning', 'Who wants to take the lead on this?', 'Ai muốn chủ trì phần này?', '/huː wɒnts tu teɪk ðə liːd/', 1),
  ('Group project planning', 'Let''s split into smaller tasks', 'Chia thành các đầu việc nhỏ nhé', '/lɛts splɪt ˈɪntu ˈsmɔːlər tæsks/', 2),
  ('Group project planning', 'When is everyone free to meet?', 'Mọi người rảnh khi nào?', '/wɛn ɪz ˈɛvriwʌn friː tu miːt/', 3),

  ('Class presentation Q&A', 'That is a great question', 'Câu hỏi rất hay', '/ðæt ɪz ə ɡreɪt ˈkwɛstʃən/', 1),
  ('Class presentation Q&A', 'Let me address that in two parts', 'Để tôi trả lời theo hai ý', '/lɛt miː əˈdrɛs ðæt ɪn tuː pɑːrts/', 2),
  ('Class presentation Q&A', 'I do not know but I will follow up', 'Tôi chưa rõ, tôi sẽ tìm hiểu thêm', '/aɪ duː nɒt noʊ/', 3),

  ('Library help', 'I am looking for this book', 'Tôi đang tìm cuốn sách này', '/aɪ æm ˈlʊkɪŋ fɔːr ðɪs bʊk/', 1),
  ('Library help', 'Can I extend my loan?', 'Tôi có thể gia hạn không?', '/kæn aɪ ɪkˈstɛnd maɪ loʊn/', 2),
  ('Library help', 'Where is the quiet study area?', 'Khu học yên tĩnh ở đâu?', '/wɛr ɪz ðə ˈkwaɪət ˈstʌdi ˈɛriə/', 3),

  -- Industry
  ('Tech bug triage', 'I can reproduce this on staging', 'Tôi tái hiện lỗi được trên staging', '/aɪ kæn riːprəˈdjuːs ðɪs/', 1),
  ('Tech bug triage', 'It blocks the checkout flow', 'Nó chặn luồng thanh toán', '/ɪt blɒks ðə ˈtʃɛkaʊt floʊ/', 2),
  ('Tech bug triage', 'Severity is P1, customer-facing', 'Mức độ P1, người dùng cuối thấy', '/sɪˈvɛrəti ɪz piː wʌn/', 3),

  ('Customer support call', 'I am sorry to hear that, let me help', 'Rất tiếc về việc này, để tôi hỗ trợ', '/aɪ æm ˈsɒri tu hɪər ðæt/', 1),
  ('Customer support call', 'Could you walk me through what happened?', 'Bạn kể lại sự việc giúp tôi nhé?', '/kʊd ju wɔːk miː θruː/', 2),
  ('Customer support call', 'Here is what I can do for you', 'Tôi có thể làm thế này cho bạn', '/hɪər ɪz wɒt aɪ kæn duː/', 3),

  ('Pitch to a client', 'Our product solves three pain points', 'Sản phẩm chúng tôi giải quyết 3 vấn đề', '/aʊr ˈprɒdʌkt sɒlvz θriː peɪn pɔɪnts/', 1),
  ('Pitch to a client', 'What is most important to you?', 'Điều gì quan trọng nhất với bạn?', '/wɒt ɪz moʊst ɪmˈpɔːrtənt/', 2),
  ('Pitch to a client', 'Can we schedule a follow-up?', 'Mình hẹn buổi tiếp theo nhé?', '/kæn wi ˈʃɛdʒuːl ə ˈfɒloʊ ʌp/', 3),

  ('Hospital admission', 'I have been having sharp chest pain', 'Tôi bị đau ngực dữ dội', '/aɪ hæv biːn ˈhævɪŋ ʃɑːrp tʃɛst peɪn/', 1),
  ('Hospital admission', 'My medical history includes...', 'Tiền sử bệnh của tôi gồm...', '/maɪ ˈmɛdɪkəl ˈhɪstəri/', 2),
  ('Hospital admission', 'Do I need to fast before the test?', 'Tôi có cần nhịn ăn trước xét nghiệm không?', '/duː aɪ niːd tu fæst/', 3)
) AS kp(scenario_title, english, vietnamese, ipa, sort_order)
  ON kp.scenario_title = i.title;
