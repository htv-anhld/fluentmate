-- Seed 300 vocabulary cards per user, 10/day for 30 days.
-- Idempotent: a unique marker phrase guards against double-seeding.
-- Phrases cover greetings → small talk → office → travel → idioms (A1→B2).

CREATE OR REPLACE FUNCTION public.seed_extended_vocabulary(uid uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  -- Unique marker phrase from this seed pack — used to detect re-runs.
  marker text := 'How are you doing today?';
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.vocabulary WHERE user_id = uid AND english = marker LIMIT 1
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.vocabulary (user_id, english, vietnamese, ipa, next_review_at)
  SELECT
    uid,
    p.eng,
    p.vi,
    p.ipa,
    (current_date + ((row_number() OVER () - 1) / 10)::int)::date
  FROM (VALUES
    -- Day 1 — Greetings & basic A1
    ('How are you doing today?', 'Hôm nay bạn thế nào?', '/haʊ ɑːr ju ˈduːɪŋ təˈdeɪ/'),
    ('Nice to meet you', 'Rất vui được gặp bạn', '/naɪs tə miːt ju/'),
    ('See you tomorrow', 'Hẹn gặp lại ngày mai', '/siː ju təˈmɒroʊ/'),
    ('Have a good one', 'Chúc một ngày tốt lành', '/hæv ə ɡʊd wʌn/'),
    ('Take care', 'Bảo trọng nhé', '/teɪk kɛr/'),
    ('Good to see you', 'Vui vì gặp bạn', '/ɡʊd tə siː ju/'),
    ('Long time no see', 'Lâu rồi không gặp', '/lɒŋ taɪm noʊ siː/'),
    ('How have you been?', 'Dạo này thế nào?', '/haʊ hæv ju biːn/'),
    ('Catch you later', 'Hẹn gặp sau nhé', '/kætʃ ju ˈleɪtər/'),
    ('Welcome back', 'Mừng bạn quay lại', '/ˈwɛlkəm bæk/'),

    -- Day 2 — Self intro A1
    ('Let me introduce myself', 'Để tôi tự giới thiệu', '/lɛt miː ˌɪntrəˈdjuːs maɪˈsɛlf/'),
    ('I''m from Vietnam', 'Tôi đến từ Việt Nam', '/aɪm frəm ˌviːɛtˈnɑːm/'),
    ('I work as a developer', 'Tôi làm lập trình viên', '/aɪ wɜːk æz ə dɪˈvɛləpər/'),
    ('I''m studying English', 'Tôi đang học tiếng Anh', '/aɪm ˈstʌdiɪŋ ˈɪŋɡlɪʃ/'),
    ('Where are you from?', 'Bạn đến từ đâu?', '/wɛr ɑːr ju frəm/'),
    ('What do you do?', 'Bạn làm nghề gì?', '/wɒt dʊ ju duː/'),
    ('How old are you?', 'Bạn bao nhiêu tuổi?', '/haʊ oʊld ɑːr ju/'),
    ('I''m a beginner', 'Tôi là người mới', '/aɪm ə bɪˈɡɪnər/'),
    ('I live in Hanoi', 'Tôi sống ở Hà Nội', '/aɪ lɪv ɪn hɑːˈnɔɪ/'),
    ('I have two siblings', 'Tôi có hai anh chị em', '/aɪ hæv tuː ˈsɪblɪŋz/'),

    -- Day 3 — Polite asking
    ('Could you say that again?', 'Bạn nói lại được không?', '/kʊd ju seɪ ðæt əˈɡɛn/'),
    ('Could you speak slower?', 'Bạn nói chậm hơn nhé?', '/kʊd ju spiːk ˈsloʊər/'),
    ('What does that mean?', 'Câu đó nghĩa là gì?', '/wɒt dʌz ðæt miːn/'),
    ('How do you spell it?', 'Đánh vần thế nào?', '/haʊ duː ju spɛl ɪt/'),
    ('Excuse me, can I ask?', 'Xin lỗi, tôi hỏi được không?', '/ɪkˈskjuːz miː kæn aɪ æsk/'),
    ('I don''t understand', 'Tôi không hiểu', '/aɪ doʊnt ˌʌndərˈstænd/'),
    ('Could you help me?', 'Bạn giúp tôi được không?', '/kʊd ju hɛlp miː/'),
    ('Is that correct?', 'Như vậy có đúng không?', '/ɪz ðæt kəˈrɛkt/'),
    ('What do you think?', 'Bạn nghĩ sao?', '/wɒt duː ju θɪŋk/'),
    ('Can I borrow this?', 'Tôi mượn cái này được không?', '/kæn aɪ ˈbɒroʊ ðɪs/'),

    -- Day 4 — Numbers & time
    ('What time is it?', 'Mấy giờ rồi?', '/wɒt taɪm ɪz ɪt/'),
    ('It''s half past three', 'Ba giờ rưỡi', '/ɪts hɑːf pɑːst θriː/'),
    ('A quarter to nine', 'Chín giờ kém mười lăm', '/ə ˈkwɔːrtər tə naɪn/'),
    ('See you at noon', 'Gặp bạn buổi trưa', '/siː ju æt nuːn/'),
    ('In five minutes', 'Trong năm phút nữa', '/ɪn faɪv ˈmɪnɪts/'),
    ('Twice a week', 'Hai lần một tuần', '/twaɪs ə wiːk/'),
    ('On Mondays', 'Vào các thứ Hai', '/ɒn ˈmʌndeɪz/'),
    ('All day long', 'Cả ngày dài', '/ɔːl deɪ lɒŋ/'),
    ('First of all', 'Trước hết', '/fɜːst əv ɔːl/'),
    ('At the moment', 'Vào lúc này', '/æt ðə ˈmoʊmənt/'),

    -- Day 5 — Daily routine
    ('I wake up early', 'Tôi dậy sớm', '/aɪ weɪk ʌp ˈɜːli/'),
    ('I brush my teeth', 'Tôi đánh răng', '/aɪ brʌʃ maɪ tiːθ/'),
    ('I take a shower', 'Tôi tắm', '/aɪ teɪk ə ˈʃaʊər/'),
    ('I have breakfast', 'Tôi ăn sáng', '/aɪ hæv ˈbrɛkfəst/'),
    ('I go to work', 'Tôi đi làm', '/aɪ ɡoʊ tə wɜːk/'),
    ('I work from home', 'Tôi làm ở nhà', '/aɪ wɜːk frəm hoʊm/'),
    ('I cook dinner', 'Tôi nấu bữa tối', '/aɪ kʊk ˈdɪnər/'),
    ('I go to bed late', 'Tôi đi ngủ muộn', '/aɪ ɡoʊ tə bɛd leɪt/'),
    ('I work out at the gym', 'Tôi tập gym', '/aɪ wɜːk aʊt æt ðə dʒɪm/'),
    ('I do the laundry', 'Tôi giặt đồ', '/aɪ duː ðə ˈlɔːndri/'),

    -- Day 6 — Family & friends
    ('My older brother', 'Anh trai tôi', '/maɪ ˈoʊldər ˈbrʌðər/'),
    ('My younger sister', 'Em gái tôi', '/maɪ ˈjʌŋɡər ˈsɪstər/'),
    ('My best friend', 'Bạn thân tôi', '/maɪ bɛst frɛnd/'),
    ('We grew up together', 'Chúng tôi lớn lên cùng nhau', '/wi ɡruː ʌp təˈɡɛðər/'),
    ('We''re really close', 'Chúng tôi rất thân', '/wɪər ˈrɪəli kloʊs/'),
    ('I miss my family', 'Tôi nhớ gia đình', '/aɪ mɪs maɪ ˈfæməli/'),
    ('We hang out often', 'Chúng tôi hay đi chơi', '/wi hæŋ aʊt ˈɒfən/'),
    ('She is my cousin', 'Cô ấy là anh chị họ tôi', '/ʃi ɪz maɪ ˈkʌzən/'),
    ('Family comes first', 'Gia đình là trên hết', '/ˈfæməli kʌmz fɜːst/'),
    ('We have a lot in common', 'Chúng tôi có nhiều điểm chung', '/wi hæv ə lɒt ɪn ˈkɒmən/'),

    -- Day 7 — Weather & seasons
    ('It''s raining cats and dogs', 'Mưa to lắm', '/ɪts ˈreɪnɪŋ kæts ænd dɒɡz/'),
    ('It''s freezing outside', 'Bên ngoài lạnh cóng', '/ɪts ˈfriːzɪŋ ˌaʊtˈsaɪd/'),
    ('What''s the weather like?', 'Thời tiết thế nào?', '/wɒts ðə ˈwɛðər laɪk/'),
    ('It''s a sunny day', 'Trời nắng đẹp', '/ɪts ə ˈsʌni deɪ/'),
    ('It''s pretty humid', 'Trời khá ẩm', '/ɪts ˈprɪti ˈhjuːmɪd/'),
    ('Bring an umbrella', 'Mang theo ô', '/brɪŋ ən ʌmˈbrɛlə/'),
    ('Stay warm', 'Giữ ấm nhé', '/steɪ wɔːm/'),
    ('It''s starting to rain', 'Trời bắt đầu mưa', '/ɪts ˈstɑːtɪŋ tə reɪn/'),
    ('I love autumn', 'Tôi thích mùa thu', '/aɪ lʌv ˈɔːtəm/'),
    ('Summer is my favorite', 'Tôi thích nhất mùa hè', '/ˈsʌmər ɪz maɪ ˈfeɪvərɪt/'),

    -- Day 8 — Café & food order
    ('I''ll have an iced coffee', 'Cho tôi cà phê đá', '/aɪl hæv ən aɪst ˈkɒfi/'),
    ('To go, please', 'Mang đi nhé', '/tə ɡoʊ pliːz/'),
    ('For here, please', 'Uống tại quán', '/fə hɪər pliːz/'),
    ('Can I get less sugar?', 'Cho ít đường được không?', '/kæn aɪ ɡɛt lɛs ˈʃʊɡər/'),
    ('Make it a large', 'Cho cỡ lớn nhé', '/meɪk ɪt ə lɑːdʒ/'),
    ('Without milk, please', 'Không sữa nhé', '/wɪˈðaʊt mɪlk pliːz/'),
    ('What''s the special?', 'Hôm nay có gì đặc biệt?', '/wɒts ðə ˈspɛʃəl/'),
    ('Could I see the menu?', 'Cho tôi xem thực đơn', '/kʊd aɪ siː ðə ˈmɛnjuː/'),
    ('I''m ready to order', 'Tôi gọi món luôn', '/aɪm ˈrɛdi tə ˈɔːdər/'),
    ('Could we get the bill?', 'Cho tính tiền', '/kʊd wi ɡɛt ðə bɪl/'),

    -- Day 9 — Restaurant detail
    ('I''m allergic to peanuts', 'Tôi dị ứng với đậu phộng', '/aɪm əˈlɜːdʒɪk tə ˈpiːnʌts/'),
    ('I''m vegetarian', 'Tôi ăn chay', '/aɪm ˌvɛdʒəˈtɛəriən/'),
    ('No spicy, please', 'Không cay nhé', '/noʊ ˈspaɪsi pliːz/'),
    ('Could we split the bill?', 'Mình chia tiền được không?', '/kʊd wi splɪt ðə bɪl/'),
    ('Keep the change', 'Giữ tiền thừa', '/kiːp ðə tʃeɪndʒ/'),
    ('That was delicious', 'Ngon tuyệt', '/ðæt wəz dɪˈlɪʃəs/'),
    ('Could we have water?', 'Cho xin nước', '/kʊd wi hæv ˈwɔːtər/'),
    ('Is this dish gluten-free?', 'Món này không gluten chứ?', '/ɪz ðɪs dɪʃ ˈɡluːtən friː/'),
    ('Medium rare, please', 'Tái vừa thôi nhé', '/ˈmiːdiəm rɛr pliːz/'),
    ('Compliments to the chef', 'Khen đầu bếp giúp tôi', '/ˈkɒmplɪmənts tə ðə ʃɛf/'),

    -- Day 10 — Shopping basics
    ('How much is this?', 'Cái này bao nhiêu?', '/haʊ mʌtʃ ɪz ðɪs/'),
    ('Do you take cards?', 'Có quẹt thẻ được không?', '/duː ju teɪk kɑːdz/'),
    ('I''m just looking', 'Tôi xem qua thôi', '/aɪm dʒʌst ˈlʊkɪŋ/'),
    ('Can I try this on?', 'Tôi thử được không?', '/kæn aɪ traɪ ðɪs ɒn/'),
    ('Do you have it in blue?', 'Có màu xanh không?', '/duː ju hæv ɪt ɪn bluː/'),
    ('Is this on sale?', 'Cái này có giảm không?', '/ɪz ðɪs ɒn seɪl/'),
    ('Could I get a discount?', 'Bớt cho tôi chút được không?', '/kʊd aɪ ɡɛt ə ˈdɪskaʊnt/'),
    ('Where''s the fitting room?', 'Phòng thử đồ ở đâu?', '/wɛrz ðə ˈfɪtɪŋ ruːm/'),
    ('I''ll take it', 'Tôi lấy cái này', '/aɪl teɪk ɪt/'),
    ('Could I get a receipt?', 'Cho tôi hóa đơn', '/kʊd aɪ ɡɛt ə rɪˈsiːt/'),

    -- Day 11 — Shopping detail
    ('Can I return this?', 'Tôi đổi trả được không?', '/kæn aɪ rɪˈtɜːn ðɪs/'),
    ('It doesn''t fit', 'Không vừa', '/ɪt ˈdʌzənt fɪt/'),
    ('Do you have a smaller size?', 'Có size nhỏ hơn không?', '/duː ju hæv ə ˈsmɔːlər saɪz/'),
    ('I changed my mind', 'Tôi đổi ý', '/aɪ tʃeɪndʒd maɪ maɪnd/'),
    ('Is it still under warranty?', 'Còn bảo hành không?', '/ɪz ɪt stɪl ˈʌndər ˈwɒrənti/'),
    ('It''s a good deal', 'Giá hời', '/ɪts ə ɡʊd diːl/'),
    ('That''s out of my budget', 'Vượt ngân sách của tôi', '/ðæts aʊt əv maɪ ˈbʌdʒɪt/'),
    ('Can you wrap it as a gift?', 'Gói quà giúp tôi nhé?', '/kæn ju ræp ɪt æz ə ɡɪft/'),
    ('Add it to my cart', 'Cho vào giỏ', '/æd ɪt tə maɪ kɑːt/'),
    ('It''s sold out', 'Hết hàng rồi', '/ɪts soʊld aʊt/'),

    -- Day 12 — Travel airport B1
    ('I''d like an aisle seat', 'Tôi muốn ghế lối đi', '/aɪd laɪk ən aɪl siːt/'),
    ('Where''s the gate?', 'Cổng ở đâu?', '/wɛrz ðə ɡeɪt/'),
    ('My flight is delayed', 'Chuyến bay bị hoãn', '/maɪ flaɪt ɪz dɪˈleɪd/'),
    ('I missed my connection', 'Tôi lỡ chuyến nối', '/aɪ mɪst maɪ kəˈnɛkʃən/'),
    ('Is this carry-on okay?', 'Hành lý xách tay này ổn không?', '/ɪz ðɪs ˈkæri ɒn ˈoʊkeɪ/'),
    ('Where''s baggage claim?', 'Khu nhận hành lý ở đâu?', '/wɛrz ˈbæɡɪdʒ kleɪm/'),
    ('I''m here on vacation', 'Tôi đi du lịch', '/aɪm hɪər ɒn vəˈkeɪʃən/'),
    ('Just passing through', 'Tôi quá cảnh thôi', '/dʒʌst ˈpɑːsɪŋ θruː/'),
    ('Anything to declare?', 'Có gì cần khai báo không?', '/ˈɛniθɪŋ tə dɪˈklɛr/'),
    ('Have a safe flight', 'Bay an toàn nhé', '/hæv ə seɪf flaɪt/'),

    -- Day 13 — Travel hotel
    ('I have a reservation', 'Tôi đã đặt phòng', '/aɪ hæv ə ˌrɛzəˈveɪʃən/'),
    ('What time is check-out?', 'Mấy giờ trả phòng?', '/wɒt taɪm ɪz ˈtʃɛkaʊt/'),
    ('Is breakfast included?', 'Có bữa sáng không?', '/ɪz ˈbrɛkfəst ɪnˈkluːdɪd/'),
    ('Could I get extra towels?', 'Cho thêm khăn nhé?', '/kʊd aɪ ɡɛt ˈɛkstrə ˈtaʊəlz/'),
    ('The Wi-Fi isn''t working', 'Wi-Fi không vào được', '/ðə ˈwaɪfaɪ ˈɪzənt ˈwɜːkɪŋ/'),
    ('Can I get a wake-up call?', 'Báo thức giúp tôi nhé?', '/kæn aɪ ɡɛt ə weɪk ʌp kɔːl/'),
    ('Where''s the elevator?', 'Thang máy ở đâu?', '/wɛrz ði ˈɛləveɪtər/'),
    ('Could I get a late check-out?', 'Trả phòng trễ được không?', '/kʊd aɪ ɡɛt ə leɪt ˈtʃɛkaʊt/'),
    ('Could you call a taxi?', 'Gọi taxi giúp tôi nhé?', '/kʊd ju kɔːl ə ˈtæksi/'),
    ('Thanks for your stay', 'Cảm ơn đã ghé chỗ chúng tôi', '/θæŋks fə jɔːr steɪ/'),

    -- Day 14 — Directions
    ('Excuse me, where''s the station?', 'Cho hỏi ga ở đâu?', '/ɪkˈskjuːz miː wɛrz ðə ˈsteɪʃən/'),
    ('Go straight ahead', 'Đi thẳng', '/ɡoʊ streɪt əˈhɛd/'),
    ('Turn left at the corner', 'Rẽ trái ở góc', '/tɜːn lɛft æt ðə ˈkɔːnər/'),
    ('It''s next to the bank', 'Cạnh ngân hàng', '/ɪts nɛkst tə ðə bæŋk/'),
    ('How far is it?', 'Còn bao xa?', '/haʊ fɑː ɪz ɪt/'),
    ('Is it walkable?', 'Đi bộ tới được không?', '/ɪz ɪt ˈwɔːkəbl/'),
    ('I''m lost', 'Tôi bị lạc', '/aɪm lɒst/'),
    ('Use Google Maps', 'Dùng Google Maps đi', '/juːz ˈɡuːɡl mæps/'),
    ('It''s around the corner', 'Vòng qua góc là tới', '/ɪts əˈraʊnd ðə ˈkɔːnər/'),
    ('Across from the park', 'Đối diện công viên', '/əˈkrɒs frəm ðə pɑːk/'),

    -- Day 15 — Public transport
    ('Where''s the bus stop?', 'Trạm xe buýt ở đâu?', '/wɛrz ðə bʌs stɒp/'),
    ('Which line goes downtown?', 'Tuyến nào đi trung tâm?', '/wɪtʃ laɪn ɡoʊz ˈdaʊntaʊn/'),
    ('One ticket, please', 'Cho một vé', '/wʌn ˈtɪkɪt pliːz/'),
    ('Does this go to airport?', 'Tới sân bay phải không?', '/dʌz ðɪs ɡoʊ tə ˈɛrpɔːt/'),
    ('I need a transfer', 'Tôi cần đổi tuyến', '/aɪ niːd ə ˈtrænsfɜːr/'),
    ('How long is the ride?', 'Đi lâu không?', '/haʊ lɒŋ ɪz ðə raɪd/'),
    ('Next stop, please', 'Cho xuống trạm sau', '/nɛkst stɒp pliːz/'),
    ('I''ll take a cab', 'Tôi đi taxi', '/aɪl teɪk ə kæb/'),
    ('Could you turn on the meter?', 'Bật đồng hồ giúp tôi', '/kʊd ju tɜːn ɒn ðə ˈmiːtər/'),
    ('Drop me off here', 'Cho tôi xuống đây', '/drɒp miː ɒf hɪər/'),

    -- Day 16 — Doctor & health
    ('I''m not feeling well', 'Tôi thấy không khoẻ', '/aɪm nɒt ˈfiːlɪŋ wɛl/'),
    ('I have a headache', 'Tôi bị đau đầu', '/aɪ hæv ə ˈhɛdeɪk/'),
    ('I have a fever', 'Tôi bị sốt', '/aɪ hæv ə ˈfiːvər/'),
    ('My back is killing me', 'Lưng tôi đau quá', '/maɪ bæk ɪz ˈkɪlɪŋ miː/'),
    ('Could I see a doctor?', 'Cho tôi gặp bác sĩ', '/kʊd aɪ siː ə ˈdɒktər/'),
    ('Take this twice a day', 'Uống ngày hai lần', '/teɪk ðɪs twaɪs ə deɪ/'),
    ('Get well soon', 'Mau khỏe nhé', '/ɡɛt wɛl suːn/'),
    ('I twisted my ankle', 'Tôi bị bong gân chân', '/aɪ ˈtwɪstɪd maɪ ˈæŋkl/'),
    ('Is it something serious?', 'Có nghiêm trọng không?', '/ɪz ɪt ˈsʌmθɪŋ ˈsɪəriəs/'),
    ('I''ll get some rest', 'Tôi nghỉ ngơi đã', '/aɪl ɡɛt sʌm rɛst/'),

    -- Day 17 — Office greetings
    ('Welcome aboard', 'Chào mừng gia nhập', '/ˈwɛlkəm əˈbɔːd/'),
    ('Let''s sync up later', 'Mình sync sau nhé', '/lɛts sɪŋk ʌp ˈleɪtər/'),
    ('Quick favor?', 'Nhờ chút việc nhé?', '/kwɪk ˈfeɪvər/'),
    ('Are you free now?', 'Bây giờ rảnh không?', '/ɑː ju friː naʊ/'),
    ('Could you join me?', 'Vào họp với tôi nhé?', '/kʊd ju dʒɔɪn miː/'),
    ('Got a minute?', 'Rảnh một phút không?', '/ɡɒt ə ˈmɪnɪt/'),
    ('I''ll loop you in', 'Tôi sẽ thông tin cho bạn', '/aɪl luːp ju ɪn/'),
    ('Catch up over coffee?', 'Cà phê chém gió nhé?', '/kætʃ ʌp ˈoʊvər ˈkɒfi/'),
    ('Heads up', 'Báo trước nhé', '/hɛdz ʌp/'),
    ('Sounds good to me', 'Nghe ổn đó', '/saʊndz ɡʊd tə miː/'),

    -- Day 18 — Office meeting
    ('Let''s get started', 'Bắt đầu nào', '/lɛts ɡɛt ˈstɑːtɪd/'),
    ('What''s the agenda?', 'Nội dung họp là gì?', '/wɒts ði əˈdʒɛndə/'),
    ('Could you take notes?', 'Bạn ghi note giúp được không?', '/kʊd ju teɪk noʊts/'),
    ('Let''s table that', 'Để vấn đề đó sau', '/lɛts ˈteɪbl ðæt/'),
    ('Any objections?', 'Có ai phản đối không?', '/ˈɛni əbˈdʒɛkʃənz/'),
    ('Let''s vote on it', 'Mình bỏ phiếu nhé', '/lɛts voʊt ɒn ɪt/'),
    ('Moving on', 'Sang ý tiếp', '/ˈmuːvɪŋ ɒn/'),
    ('Wrapping up', 'Kết thúc đây', '/ˈræpɪŋ ʌp/'),
    ('Action items?', 'Việc cần làm là gì?', '/ˈækʃən ˈaɪtəmz/'),
    ('I''ll send minutes after', 'Tôi gửi biên bản sau', '/aɪl sɛnd ˈmɪnɪts ˈɑːftər/'),

    -- Day 19 — Office email
    ('Per my last email', 'Như email trước', '/pɜː maɪ lɑːst ˈiːmeɪl/'),
    ('Following up on this', 'Theo dõi vụ này', '/ˈfɒloʊɪŋ ʌp ɒn ðɪs/'),
    ('Looping in Sarah', 'CC Sarah luôn', '/ˈluːpɪŋ ɪn ˈsɛrə/'),
    ('Best regards', 'Trân trọng', '/bɛst rɪˈɡɑːdz/'),
    ('Hope this helps', 'Mong giúp được', '/hoʊp ðɪs hɛlps/'),
    ('Awaiting your reply', 'Mong phản hồi của bạn', '/əˈweɪtɪŋ jɔːr rɪˈplaɪ/'),
    ('Please find attached', 'Vui lòng xem file đính kèm', '/pliːz faɪnd əˈtætʃt/'),
    ('Apologies for the delay', 'Xin lỗi vì chậm trễ', '/əˈpɒlədʒiz fə ðə dɪˈleɪ/'),
    ('Just a quick note', 'Chỉ note ngắn thôi', '/dʒʌst ə kwɪk noʊt/'),
    ('Let me know your thoughts', 'Cho tôi biết ý bạn', '/lɛt miː noʊ jɔːr θɔːts/'),

    -- Day 20 — Feedback B1
    ('Great job on this', 'Bạn làm tốt lắm', '/ɡreɪt dʒɒb ɒn ðɪs/'),
    ('I appreciate the effort', 'Cảm ơn đã nỗ lực', '/aɪ əˈpriːʃieɪt ði ˈɛfət/'),
    ('Could be tighter', 'Có thể chặt hơn', '/kʊd biː ˈtaɪtər/'),
    ('Let''s polish this', 'Mình hoàn thiện nó nhé', '/lɛts ˈpɒlɪʃ ðɪs/'),
    ('Constructive feedback', 'Phản hồi mang tính xây dựng', '/kənˈstrʌktɪv ˈfiːdbæk/'),
    ('Keep it up', 'Tiếp tục phát huy', '/kiːp ɪt ʌp/'),
    ('Room for improvement', 'Còn có thể cải thiện', '/ruːm fɔːr ɪmˈpruːvmənt/'),
    ('Take it with a grain of salt', 'Đừng quá để bụng', '/teɪk ɪt wɪð ə ɡreɪn əv sɔːlt/'),
    ('You nailed it', 'Bạn đỉnh thật', '/ju neɪld ɪt/'),
    ('That''s on me', 'Đó là lỗi của tôi', '/ðæts ɒn miː/'),

    -- Day 21 — Phone & call
    ('May I speak to Mark?', 'Cho tôi nói chuyện với Mark', '/meɪ aɪ spiːk tə mɑːk/'),
    ('Speaking', 'Tôi đang nghe', '/ˈspiːkɪŋ/'),
    ('Could you hold on?', 'Bạn giữ máy nhé?', '/kʊd ju hoʊld ɒn/'),
    ('I''ll transfer you', 'Tôi chuyển máy nhé', '/aɪl ˈtrænsfɜːr ju/'),
    ('Sorry, wrong number', 'Xin lỗi, nhầm số', '/ˈsɒri rɒŋ ˈnʌmbər/'),
    ('Could you call back?', 'Gọi lại sau giúp nhé?', '/kʊd ju kɔːl bæk/'),
    ('I''ll leave a message', 'Tôi để lại tin', '/aɪl liːv ə ˈmɛsɪdʒ/'),
    ('Bad reception here', 'Sóng yếu quá', '/bæd rɪˈsɛpʃən hɪər/'),
    ('You''re breaking up', 'Bạn nói ngắt quãng', '/jɔː ˈbreɪkɪŋ ʌp/'),
    ('Let me put you on speaker', 'Để tôi bật loa ngoài', '/lɛt miː pʊt ju ɒn ˈspiːkər/'),

    -- Day 22 — Tech & devices
    ('It froze on me', 'Máy bị đứng', '/ɪt froʊz ɒn miː/'),
    ('Restart your computer', 'Khởi động lại máy', '/rɪˈstɑːt jɔːr kəmˈpjuːtər/'),
    ('Could you share your screen?', 'Chia sẻ màn hình nhé?', '/kʊd ju ʃɛr jɔːr skriːn/'),
    ('You''re on mute', 'Bạn đang tắt mic', '/jɔː ɒn mjuːt/'),
    ('My battery is dying', 'Pin sắp hết', '/maɪ ˈbætəri ɪz ˈdaɪɪŋ/'),
    ('Connection is unstable', 'Mạng chập chờn', '/kəˈnɛkʃən ɪz ʌnˈsteɪbl/'),
    ('Could you resend the link?', 'Gửi lại link giúp tôi nhé?', '/kʊd ju riːˈsɛnd ðə lɪŋk/'),
    ('Update available', 'Có bản cập nhật', '/ˈʌpdeɪt əˈveɪləbl/'),
    ('Back up your files', 'Sao lưu file đi', '/bæk ʌp jɔːr faɪlz/'),
    ('I''m offline today', 'Hôm nay tôi off', '/aɪm ˈɒflaɪn təˈdeɪ/'),

    -- Day 23 — Opinions & agreement B2
    ('I see your point', 'Tôi hiểu ý bạn', '/aɪ siː jɔːr pɔɪnt/'),
    ('Couldn''t agree more', 'Đồng ý hoàn toàn', '/ˈkʊdənt əˈɡriː mɔːr/'),
    ('Fair enough', 'Cũng có lý', '/fɛr ɪˈnʌf/'),
    ('That''s a good call', 'Quyết định hay', '/ðæts ə ɡʊd kɔːl/'),
    ('Spot on', 'Chuẩn không cần chỉnh', '/spɒt ɒn/'),
    ('I''m on the fence', 'Tôi còn phân vân', '/aɪm ɒn ðə fɛns/'),
    ('That makes sense', 'Hợp lý đó', '/ðæt meɪks sɛns/'),
    ('I''ll go along with it', 'Tôi theo ý bạn', '/aɪl ɡoʊ əˈlɒŋ wɪð ɪt/'),
    ('It''s a fair point', 'Ý đó hợp lý', '/ɪts ə fɛr pɔɪnt/'),
    ('I''m all for it', 'Tôi ủng hộ', '/aɪm ɔːl fə ɪt/'),

    -- Day 24 — Disagreement politeness B2
    ('I beg to differ', 'Tôi xin phản biện', '/aɪ bɛɡ tə ˈdɪfər/'),
    ('I''m not so sure', 'Tôi không chắc lắm', '/aɪm nɒt soʊ ʃʊr/'),
    ('Have you considered...?', 'Bạn cân nhắc... chưa?', '/hæv ju kənˈsɪdəd/'),
    ('Just to push back', 'Tôi xin phản biện chút', '/dʒʌst tə pʊʃ bæk/'),
    ('That''s debatable', 'Còn phải bàn', '/ðæts dɪˈbeɪtəbl/'),
    ('Let''s agree to disagree', 'Mỗi người giữ ý mình', '/lɛts əˈɡriː tə ˌdɪsəˈɡriː/'),
    ('I see it differently', 'Tôi thấy khác', '/aɪ siː ɪt ˈdɪfərəntli/'),
    ('Not necessarily', 'Không hẳn vậy', '/nɒt ˌnɛsəˈsɛrəli/'),
    ('I''d push for...', 'Tôi nghiêng về...', '/aɪd pʊʃ fɔːr/'),
    ('With all due respect', 'Với tất cả sự tôn trọng', '/wɪð ɔːl djuː rɪˈspɛkt/'),

    -- Day 25 — Emotions & reactions B2
    ('I''m thrilled about it', 'Tôi rất phấn khích', '/aɪm θrɪld əˈbaʊt ɪt/'),
    ('I''m bummed out', 'Tôi buồn thật', '/aɪm bʌmd aʊt/'),
    ('That''s frustrating', 'Bực thật', '/ðæts ˈfrʌstreɪtɪŋ/'),
    ('I''m so grateful', 'Tôi rất biết ơn', '/aɪm soʊ ˈɡreɪtfʊl/'),
    ('You made my day', 'Bạn làm tôi vui cả ngày', '/ju meɪd maɪ deɪ/'),
    ('I feel overwhelmed', 'Tôi quá tải', '/aɪ fiːl ˌoʊvərˈwɛlmd/'),
    ('It''s a relief', 'Thật nhẹ nhõm', '/ɪts ə rɪˈliːf/'),
    ('I''m a bit nervous', 'Tôi hơi hồi hộp', '/aɪm ə bɪt ˈnɜːvəs/'),
    ('I''m proud of you', 'Tôi tự hào về bạn', '/aɪm praʊd əv ju/'),
    ('That broke my heart', 'Câu đó làm tôi đau lòng', '/ðæt broʊk maɪ hɑːt/'),

    -- Day 26 — Idioms common B2
    ('Hit the nail on the head', 'Trúng phóc', '/hɪt ðə neɪl ɒn ðə hɛd/'),
    ('Piece of cake', 'Dễ ợt', '/piːs əv keɪk/'),
    ('Under the weather', 'Hơi mệt', '/ˈʌndər ðə ˈwɛðər/'),
    ('Cost an arm and a leg', 'Đắt cắt cổ', '/kɒst ən ɑːm ænd ə lɛɡ/'),
    ('Once in a blue moon', 'Hiếm khi', '/wʌns ɪn ə bluː muːn/'),
    ('Pull yourself together', 'Bình tĩnh lại đi', '/pʊl jɔːˈsɛlf təˈɡɛðər/'),
    ('Spill the beans', 'Tiết lộ bí mật', '/spɪl ðə biːnz/'),
    ('Break the ice', 'Phá vỡ ngại ngùng', '/breɪk ði aɪs/'),
    ('Hit the books', 'Học bài đi', '/hɪt ðə bʊks/'),
    ('Burn the midnight oil', 'Thức khuya cày', '/bɜːn ðə ˈmɪdnaɪt ɔɪl/'),

    -- Day 27 — Idioms work B2
    ('Touch base later', 'Trao đổi lại sau', '/tʌtʃ beɪs ˈleɪtər/'),
    ('Move the needle', 'Tạo khác biệt rõ rệt', '/muːv ðə ˈniːdl/'),
    ('Get the ball rolling', 'Khởi động lên', '/ɡɛt ðə bɔːl ˈroʊlɪŋ/'),
    ('Drop the ball', 'Lỡ việc', '/drɒp ðə bɔːl/'),
    ('On the same page', 'Cùng quan điểm', '/ɒn ðə seɪm peɪdʒ/'),
    ('Cut corners', 'Làm tắt', '/kʌt ˈkɔːnəz/'),
    ('Think outside the box', 'Tư duy đột phá', '/θɪŋk ˌaʊtˈsaɪd ðə bɒks/'),
    ('Burn out', 'Kiệt sức', '/bɜːn aʊt/'),
    ('Bring to the table', 'Mang lại giá trị', '/brɪŋ tə ðə ˈteɪbl/'),
    ('Take the lead', 'Chủ động dẫn dắt', '/teɪk ðə liːd/'),

    -- Day 28 — Phrasal verbs
    ('Look into it', 'Tìm hiểu vụ đó', '/lʊk ˈɪntə ɪt/'),
    ('Run out of time', 'Hết thời gian', '/rʌn aʊt əv taɪm/'),
    ('Figure it out', 'Tìm ra cách', '/ˈfɪɡər ɪt aʊt/'),
    ('Come up with an idea', 'Nghĩ ra ý tưởng', '/kʌm ʌp wɪð ən aɪˈdɪə/'),
    ('Catch up on emails', 'Xử lý email tồn', '/kætʃ ʌp ɒn ˈiːmeɪlz/'),
    ('Get back to work', 'Quay lại làm việc', '/ɡɛt bæk tə wɜːk/'),
    ('Sort it out', 'Giải quyết đi', '/sɔːt ɪt aʊt/'),
    ('Slow down', 'Chậm lại', '/sloʊ daʊn/'),
    ('Speak up', 'Nói lớn lên', '/spiːk ʌp/'),
    ('Calm down', 'Bình tĩnh', '/kɑːm daʊn/'),

    -- Day 29 — Advanced expressions
    ('At the end of the day', 'Suy cho cùng', '/æt ði ɛnd əv ðə deɪ/'),
    ('Off the top of my head', 'Nhớ ngay không cần nghĩ', '/ɒf ðə tɒp əv maɪ hɛd/'),
    ('Long story short', 'Nói tóm lại', '/lɒŋ ˈstɔːri ʃɔːt/'),
    ('Speaking of which', 'Nhân tiện nói tới', '/ˈspiːkɪŋ əv wɪtʃ/'),
    ('No big deal', 'Không có gì to tát', '/noʊ bɪɡ diːl/'),
    ('That''s the catch', 'Đó là chỗ vướng', '/ðæts ðə kætʃ/'),
    ('A blessing in disguise', 'Trong cái rủi có cái may', '/ə ˈblɛsɪŋ ɪn dɪsˈɡaɪz/'),
    ('Beat around the bush', 'Vòng vo tam quốc', '/biːt əˈraʊnd ðə bʊʃ/'),
    ('Bite the bullet', 'Cắn răng làm', '/baɪt ðə ˈbʊlɪt/'),
    ('Call it a day', 'Nghỉ tay', '/kɔːl ɪt ə deɪ/'),

    -- Day 30 — Slang & casual B2
    ('No worries', 'Không sao đâu', '/noʊ ˈwʌriz/'),
    ('My bad', 'Lỗi tôi', '/maɪ bæd/'),
    ('Fingers crossed', 'Cầu may', '/ˈfɪŋɡəz krɒst/'),
    ('Shoot me a text', 'Nhắn tôi nhé', '/ʃuːt miː ə tɛkst/'),
    ('Way to go', 'Làm tốt lắm', '/weɪ tə ɡoʊ/'),
    ('You bet', 'Chắc chắn rồi', '/ju bɛt/'),
    ('That''s sick', 'Đỉnh ghê', '/ðæts sɪk/'),
    ('No biggie', 'Không to tát', '/noʊ ˈbɪɡi/'),
    ('Hang in there', 'Cố lên nhé', '/hæŋ ɪn ðɛr/'),
    ('You got this', 'Bạn làm được mà', '/ju ɡɒt ðɪs/')
  ) AS p(eng, vi, ipa);
END; $$;

-- Trigger: seed extended vocab whenever a row in public.users is created
CREATE OR REPLACE FUNCTION public.trigger_seed_extended_vocabulary()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.seed_extended_vocabulary(NEW.id);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS seed_extended_vocab_on_user_insert ON public.users;
CREATE TRIGGER seed_extended_vocab_on_user_insert
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_seed_extended_vocabulary();

-- Retroactive: seed for all existing users (idempotent via marker check)
DO $$
DECLARE
  u record;
BEGIN
  FOR u IN SELECT id FROM public.users LOOP
    PERFORM public.seed_extended_vocabulary(u.id);
  END LOOP;
END $$;
