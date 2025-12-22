// Initial content for contextual learning feature
// 50+ words with definitions and 150+ example sentences

const wordDefinitions = [
  { word: 'дом', translation: 'house, home', partOfSpeech: 'noun', gender: 'masculine', definition: 'A building for living in' },
  { word: 'кот', translation: 'cat', partOfSpeech: 'noun', gender: 'masculine', definition: 'A small domesticated feline animal' },
  { word: 'книга', translation: 'book', partOfSpeech: 'noun', gender: 'feminine', definition: 'A written or printed work consisting of pages' },
  { word: 'вода', translation: 'water', partOfSpeech: 'noun', gender: 'feminine', definition: 'A clear liquid essential for life' },
  { word: 'стол', translation: 'table', partOfSpeech: 'noun', gender: 'masculine', definition: 'A piece of furniture with a flat top' },
  { word: 'стул', translation: 'chair', partOfSpeech: 'noun', gender: 'masculine', definition: 'A piece of furniture for sitting' },
  { word: 'окно', translation: 'window', partOfSpeech: 'noun', gender: 'neuter', definition: 'An opening in a wall with glass' },
  { word: 'день', translation: 'day', partOfSpeech: 'noun', gender: 'masculine', definition: 'A period of 24 hours' },
  { word: 'ночь', translation: 'night', partOfSpeech: 'noun', gender: 'feminine', definition: 'The time when it is dark' },
  { word: 'друг', translation: 'friend', partOfSpeech: 'noun', gender: 'masculine', definition: 'A person you know well and like' },
  { word: 'мама', translation: 'mom, mother', partOfSpeech: 'noun', gender: 'feminine', definition: 'Female parent' },
  { word: 'папа', translation: 'dad, father', partOfSpeech: 'noun', gender: 'masculine', definition: 'Male parent' },
  { word: 'сын', translation: 'son', partOfSpeech: 'noun', gender: 'masculine', definition: 'Male child' },
  { word: 'дочь', translation: 'daughter', partOfSpeech: 'noun', gender: 'feminine', definition: 'Female child' },
  { word: 'брат', translation: 'brother', partOfSpeech: 'noun', gender: 'masculine', definition: 'Male sibling' },
  { word: 'хлеб', translation: 'bread', partOfSpeech: 'noun', gender: 'masculine', definition: 'Food made from flour, water, and yeast' },
  { word: 'сок', translation: 'juice', partOfSpeech: 'noun', gender: 'masculine', definition: 'Liquid from fruit or vegetables' },
  { word: 'мир', translation: 'world, peace', partOfSpeech: 'noun', gender: 'masculine', definition: 'The earth and all people; absence of war' },
  { word: 'лес', translation: 'forest', partOfSpeech: 'noun', gender: 'masculine', definition: 'A large area covered with trees' },
  { word: 'море', translation: 'sea', partOfSpeech: 'noun', gender: 'neuter', definition: 'A large body of salt water' },
  { word: 'небо', translation: 'sky', partOfSpeech: 'noun', gender: 'neuter', definition: 'The space above the earth' },
  { word: 'город', translation: 'city', partOfSpeech: 'noun', gender: 'masculine', definition: 'A large town' },
  { word: 'рука', translation: 'hand, arm', partOfSpeech: 'noun', gender: 'feminine', definition: 'The part of the body at the end of the arm' },
  { word: 'нога', translation: 'foot, leg', partOfSpeech: 'noun', gender: 'feminine', definition: 'The part of the body used for standing and walking' },
  { word: 'глаз', translation: 'eye', partOfSpeech: 'noun', gender: 'masculine', definition: 'The organ used for seeing' },
  { word: 'время', translation: 'time', partOfSpeech: 'noun', gender: 'neuter', definition: 'The ongoing sequence of events' },
  { word: 'слово', translation: 'word', partOfSpeech: 'noun', gender: 'neuter', definition: 'A unit of language' },
  { word: 'утро', translation: 'morning', partOfSpeech: 'noun', gender: 'neuter', definition: 'The early part of the day' },
  { word: 'вечер', translation: 'evening', partOfSpeech: 'noun', gender: 'masculine', definition: 'The later part of the day' },
  { word: 'зима', translation: 'winter', partOfSpeech: 'noun', gender: 'feminine', definition: 'The coldest season of the year' },
  { word: 'весна', translation: 'spring', partOfSpeech: 'noun', gender: 'feminine', definition: 'The season after winter' },
  { word: 'лето', translation: 'summer', partOfSpeech: 'noun', gender: 'neuter', definition: 'The warmest season of the year' },
  { word: 'осень', translation: 'autumn, fall', partOfSpeech: 'noun', gender: 'feminine', definition: 'The season after summer' },
  { word: 'нос', translation: 'nose', partOfSpeech: 'noun', gender: 'masculine', definition: 'The organ used for smelling' },
  { word: 'рот', translation: 'mouth', partOfSpeech: 'noun', gender: 'masculine', definition: 'The opening in the face used for eating and speaking' },
  { word: 'ухо', translation: 'ear', partOfSpeech: 'noun', gender: 'neuter', definition: 'The organ used for hearing' },
  { word: 'чашка', translation: 'cup', partOfSpeech: 'noun', gender: 'feminine', definition: 'A small container for drinking' },
  { word: 'ложка', translation: 'spoon', partOfSpeech: 'noun', gender: 'feminine', definition: 'A utensil for eating soup or stirring' },
  { word: 'нож', translation: 'knife', partOfSpeech: 'noun', gender: 'masculine', definition: 'A tool with a sharp blade for cutting' },
  { word: 'вилка', translation: 'fork', partOfSpeech: 'noun', gender: 'feminine', definition: 'A utensil with prongs for eating' },
  { word: 'тарелка', translation: 'plate', partOfSpeech: 'noun', gender: 'feminine', definition: 'A flat dish for food' },
  { word: 'ручка', translation: 'pen, handle', partOfSpeech: 'noun', gender: 'feminine', definition: 'A writing instrument; a part used to hold something' },
  { word: 'карандаш', translation: 'pencil', partOfSpeech: 'noun', gender: 'masculine', definition: 'A writing tool with graphite' },
  { word: 'путь', translation: 'path, way', partOfSpeech: 'noun', gender: 'masculine', definition: 'A route or direction' },
  { word: 'свет', translation: 'light', partOfSpeech: 'noun', gender: 'masculine', definition: 'Brightness that makes things visible' },
  { word: 'цвет', translation: 'color', partOfSpeech: 'noun', gender: 'masculine', definition: 'The appearance of things in light' },
  { word: 'лист', translation: 'leaf, sheet', partOfSpeech: 'noun', gender: 'masculine', definition: 'A part of a plant; a piece of paper' },
  { word: 'мост', translation: 'bridge', partOfSpeech: 'noun', gender: 'masculine', definition: 'A structure built over water or roads' },
  { word: 'гора', translation: 'mountain', partOfSpeech: 'noun', gender: 'feminine', definition: 'A large natural elevation' },
  { word: 'река', translation: 'river', partOfSpeech: 'noun', gender: 'feminine', definition: 'A large natural stream of water' },
  { word: 'озеро', translation: 'lake', partOfSpeech: 'noun', gender: 'neuter', definition: 'A large body of water surrounded by land' },
  { word: 'село', translation: 'village', partOfSpeech: 'noun', gender: 'neuter', definition: 'A small settlement in the countryside' },
  { word: 'место', translation: 'place, seat', partOfSpeech: 'noun', gender: 'neuter', definition: 'A location or position' },
  { word: 'поле', translation: 'field', partOfSpeech: 'noun', gender: 'neuter', definition: 'An open area of land' },
  { word: 'число', translation: 'number', partOfSpeech: 'noun', gender: 'neuter', definition: 'A mathematical value' },
  { word: 'буква', translation: 'letter', partOfSpeech: 'noun', gender: 'feminine', definition: 'A character in an alphabet' },
  { word: 'звук', translation: 'sound', partOfSpeech: 'noun', gender: 'masculine', definition: 'Something you can hear' },
  { word: 'враг', translation: 'enemy', partOfSpeech: 'noun', gender: 'masculine', definition: 'A person who is opposed to you' }
];

const exampleSentences = [
  // дом (house)
  { word: 'дом', sentence: 'Это мой дом.', translation: 'This is my house.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'дом', sentence: 'Мой дом большой.', translation: 'My house is big.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'дом', sentence: 'Я иду домой.', translation: 'I am going home.', targetPosition: 2, difficulty: 'beginner' },
  
  // кот (cat)
  { word: 'кот', sentence: 'Мой кот спит.', translation: 'My cat is sleeping.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'кот', sentence: 'Это белый кот.', translation: 'This is a white cat.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'кот', sentence: 'Кот пьёт молоко.', translation: 'The cat drinks milk.', targetPosition: 0, difficulty: 'beginner' },
  
  // книга (book)
  { word: 'книга', sentence: 'Я читаю книгу.', translation: 'I am reading a book.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'книга', sentence: 'Это новая книга.', translation: 'This is a new book.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'книга', sentence: 'Моя книга на столе.', translation: 'My book is on the table.', targetPosition: 1, difficulty: 'beginner' },
  
  // вода (water)
  { word: 'вода', sentence: 'Я пью воду.', translation: 'I drink water.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'вода', sentence: 'Вода холодная.', translation: 'The water is cold.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'вода', sentence: 'В стакане вода.', translation: 'There is water in the glass.', targetPosition: 2, difficulty: 'beginner' },
  
  // стол (table)
  { word: 'стол', sentence: 'Книга на столе.', translation: 'The book is on the table.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'стол', sentence: 'Это мой стол.', translation: 'This is my table.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'стол', sentence: 'Большой стол в комнате.', translation: 'A big table in the room.', targetPosition: 1, difficulty: 'beginner' },
  
  // стул (chair)
  { word: 'стул', sentence: 'Я сижу на стуле.', translation: 'I am sitting on a chair.', targetPosition: 3, difficulty: 'beginner' },
  { word: 'стул', sentence: 'Это новый стул.', translation: 'This is a new chair.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'стул', sentence: 'Стул у стола.', translation: 'The chair is by the table.', targetPosition: 0, difficulty: 'beginner' },
  
  // окно (window)
  { word: 'окно', sentence: 'Окно открыто.', translation: 'The window is open.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'окно', sentence: 'Большое окно в доме.', translation: 'A big window in the house.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'окно', sentence: 'Я вижу окно.', translation: 'I see the window.', targetPosition: 2, difficulty: 'beginner' },
  
  // день (day)
  { word: 'день', sentence: 'Сегодня хороший день.', translation: 'Today is a good day.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'день', sentence: 'День длинный.', translation: 'The day is long.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'день', sentence: 'Добрый день!', translation: 'Good day!', targetPosition: 1, difficulty: 'beginner' },
  
  // ночь (night)
  { word: 'ночь', sentence: 'Ночь тёмная.', translation: 'The night is dark.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'ночь', sentence: 'Спокойной ночи!', translation: 'Good night!', targetPosition: 1, difficulty: 'beginner' },
  { word: 'ночь', sentence: 'Я сплю ночью.', translation: 'I sleep at night.', targetPosition: 2, difficulty: 'beginner' },
  
  // друг (friend)
  { word: 'друг', sentence: 'Это мой друг.', translation: 'This is my friend.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'друг', sentence: 'Мой друг здесь.', translation: 'My friend is here.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'друг', sentence: 'Друг помогает мне.', translation: 'A friend helps me.', targetPosition: 0, difficulty: 'beginner' },
  
  // мама (mom)
  { word: 'мама', sentence: 'Моя мама дома.', translation: 'My mom is at home.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'мама', sentence: 'Мама готовит еду.', translation: 'Mom is cooking food.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'мама', sentence: 'Я люблю маму.', translation: 'I love mom.', targetPosition: 2, difficulty: 'beginner' },
  
  // папа (dad)
  { word: 'папа', sentence: 'Мой папа работает.', translation: 'My dad is working.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'папа', sentence: 'Папа читает книгу.', translation: 'Dad is reading a book.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'папа', sentence: 'Это мой папа.', translation: 'This is my dad.', targetPosition: 2, difficulty: 'beginner' },
  
  // сын (son)
  { word: 'сын', sentence: 'Мой сын маленький.', translation: 'My son is small.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'сын', sentence: 'Это её сын.', translation: 'This is her son.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'сын', sentence: 'Сын играет.', translation: 'The son is playing.', targetPosition: 0, difficulty: 'beginner' },
  
  // дочь (daughter)
  { word: 'дочь', sentence: 'Моя дочь красивая.', translation: 'My daughter is beautiful.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'дочь', sentence: 'Это его дочь.', translation: 'This is his daughter.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'дочь', sentence: 'Дочь учится.', translation: 'The daughter is studying.', targetPosition: 0, difficulty: 'beginner' },
  
  // брат (brother)
  { word: 'брат', sentence: 'Мой брат старший.', translation: 'My brother is older.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'брат', sentence: 'Это мой брат.', translation: 'This is my brother.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'брат', sentence: 'Брат помогает мне.', translation: 'My brother helps me.', targetPosition: 0, difficulty: 'beginner' },
  
  // хлеб (bread)
  { word: 'хлеб', sentence: 'Я ем хлеб.', translation: 'I eat bread.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'хлеб', sentence: 'Хлеб на столе.', translation: 'The bread is on the table.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'хлеб', sentence: 'Свежий хлеб вкусный.', translation: 'Fresh bread is tasty.', targetPosition: 1, difficulty: 'beginner' },
  
  // сок (juice)
  { word: 'сок', sentence: 'Я пью сок.', translation: 'I drink juice.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'сок', sentence: 'Это яблочный сок.', translation: 'This is apple juice.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'сок', sentence: 'Сок холодный.', translation: 'The juice is cold.', targetPosition: 0, difficulty: 'beginner' },
  
  // мир (world/peace)
  { word: 'мир', sentence: 'Мир большой.', translation: 'The world is big.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'мир', sentence: 'Я люблю мир.', translation: 'I love peace.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'мир', sentence: 'Во всём мире.', translation: 'In the whole world.', targetPosition: 2, difficulty: 'beginner' },
  
  // лес (forest)
  { word: 'лес', sentence: 'Лес зелёный.', translation: 'The forest is green.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'лес', sentence: 'Я гуляю в лесу.', translation: 'I walk in the forest.', targetPosition: 3, difficulty: 'beginner' },
  { word: 'лес', sentence: 'Большой лес красивый.', translation: 'A big forest is beautiful.', targetPosition: 1, difficulty: 'beginner' },
  
  // море (sea)
  { word: 'море', sentence: 'Море синее.', translation: 'The sea is blue.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'море', sentence: 'Я вижу море.', translation: 'I see the sea.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'море', sentence: 'Мы едем на море.', translation: 'We are going to the sea.', targetPosition: 3, difficulty: 'beginner' },
  
  // небо (sky)
  { word: 'небо', sentence: 'Небо голубое.', translation: 'The sky is blue.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'небо', sentence: 'Я вижу небо.', translation: 'I see the sky.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'небо', sentence: 'Чистое небо красивое.', translation: 'A clear sky is beautiful.', targetPosition: 1, difficulty: 'beginner' },
  
  // город (city)
  { word: 'город', sentence: 'Город большой.', translation: 'The city is big.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'город', sentence: 'Я живу в городе.', translation: 'I live in the city.', targetPosition: 3, difficulty: 'beginner' },
  { word: 'город', sentence: 'Это мой город.', translation: 'This is my city.', targetPosition: 2, difficulty: 'beginner' },
  
  // рука (hand)
  { word: 'рука', sentence: 'Моя рука болит.', translation: 'My hand hurts.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'рука', sentence: 'Рука чистая.', translation: 'The hand is clean.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'рука', sentence: 'Я пишу рукой.', translation: 'I write with my hand.', targetPosition: 2, difficulty: 'beginner' },
  
  // нога (foot/leg)
  { word: 'нога', sentence: 'Моя нога болит.', translation: 'My leg hurts.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'нога', sentence: 'Нога сильная.', translation: 'The leg is strong.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'нога', sentence: 'Я хожу ногами.', translation: 'I walk with my legs.', targetPosition: 2, difficulty: 'beginner' },
  
  // глаз (eye)
  { word: 'глаз', sentence: 'Мой глаз синий.', translation: 'My eye is blue.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'глаз', sentence: 'Глаз видит всё.', translation: 'The eye sees everything.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'глаз', sentence: 'Я вижу глазами.', translation: 'I see with my eyes.', targetPosition: 2, difficulty: 'beginner' },
  
  // время (time)
  { word: 'время', sentence: 'Время идёт быстро.', translation: 'Time goes quickly.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'время', sentence: 'У меня нет времени.', translation: 'I have no time.', targetPosition: 3, difficulty: 'beginner' },
  { word: 'время', sentence: 'Какое сейчас время?', translation: 'What time is it now?', targetPosition: 2, difficulty: 'beginner' },
  
  // слово (word)
  { word: 'слово', sentence: 'Это русское слово.', translation: 'This is a Russian word.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'слово', sentence: 'Слово длинное.', translation: 'The word is long.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'слово', sentence: 'Я знаю это слово.', translation: 'I know this word.', targetPosition: 3, difficulty: 'beginner' },
  
  // утро (morning)
  { word: 'утро', sentence: 'Доброе утро!', translation: 'Good morning!', targetPosition: 1, difficulty: 'beginner' },
  { word: 'утро', sentence: 'Утро холодное.', translation: 'The morning is cold.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'утро', sentence: 'Я гуляю утром.', translation: 'I walk in the morning.', targetPosition: 2, difficulty: 'beginner' },
  
  // вечер (evening)
  { word: 'вечер', sentence: 'Добрый вечер!', translation: 'Good evening!', targetPosition: 1, difficulty: 'beginner' },
  { word: 'вечер', sentence: 'Вечер тёплый.', translation: 'The evening is warm.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'вечер', sentence: 'Я читаю вечером.', translation: 'I read in the evening.', targetPosition: 2, difficulty: 'beginner' },
  
  // зима (winter)
  { word: 'зима', sentence: 'Зима холодная.', translation: 'Winter is cold.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'зима', sentence: 'Я люблю зиму.', translation: 'I love winter.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'зима', sentence: 'Зимой идёт снег.', translation: 'It snows in winter.', targetPosition: 0, difficulty: 'beginner' },
  
  // весна (spring)
  { word: 'весна', sentence: 'Весна тёплая.', translation: 'Spring is warm.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'весна', sentence: 'Я жду весну.', translation: 'I am waiting for spring.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'весна', sentence: 'Весной цветут цветы.', translation: 'Flowers bloom in spring.', targetPosition: 0, difficulty: 'beginner' },
  
  // лето (summer)
  { word: 'лето', sentence: 'Лето жаркое.', translation: 'Summer is hot.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'лето', sentence: 'Я люблю лето.', translation: 'I love summer.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'лето', sentence: 'Летом я отдыхаю.', translation: 'I rest in summer.', targetPosition: 0, difficulty: 'beginner' },
  
  // осень (autumn)
  { word: 'осень', sentence: 'Осень красивая.', translation: 'Autumn is beautiful.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'осень', sentence: 'Я гуляю осенью.', translation: 'I walk in autumn.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'осень', sentence: 'Осенью листья падают.', translation: 'Leaves fall in autumn.', targetPosition: 0, difficulty: 'beginner' },
  
  // нос (nose)
  { word: 'нос', sentence: 'Мой нос красный.', translation: 'My nose is red.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'нос', sentence: 'Нос чувствует запахи.', translation: 'The nose smells scents.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'нос', sentence: 'У кота маленький нос.', translation: 'The cat has a small nose.', targetPosition: 3, difficulty: 'beginner' },
  
  // рот (mouth)
  { word: 'рот', sentence: 'Я открыл рот.', translation: 'I opened my mouth.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'рот', sentence: 'Рот нужен для еды.', translation: 'The mouth is needed for eating.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'рот', sentence: 'Закрой рот!', translation: 'Close your mouth!', targetPosition: 1, difficulty: 'beginner' },
  
  // ухо (ear)
  { word: 'ухо', sentence: 'Моё ухо болит.', translation: 'My ear hurts.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'ухо', sentence: 'Ухо слышит звуки.', translation: 'The ear hears sounds.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'ухо', sentence: 'У кота большое ухо.', translation: 'The cat has a big ear.', targetPosition: 3, difficulty: 'beginner' },
  
  // чашка (cup)
  { word: 'чашка', sentence: 'Моя чашка пустая.', translation: 'My cup is empty.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'чашка', sentence: 'Чашка на столе.', translation: 'The cup is on the table.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'чашка', sentence: 'Я пью из чашки.', translation: 'I drink from a cup.', targetPosition: 3, difficulty: 'beginner' },
  
  // ложка (spoon)
  { word: 'ложка', sentence: 'Это моя ложка.', translation: 'This is my spoon.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'ложка', sentence: 'Ложка чистая.', translation: 'The spoon is clean.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'ложка', sentence: 'Я ем ложкой.', translation: 'I eat with a spoon.', targetPosition: 2, difficulty: 'beginner' },
  
  // нож (knife)
  { word: 'нож', sentence: 'Нож острый.', translation: 'The knife is sharp.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'нож', sentence: 'Это мой нож.', translation: 'This is my knife.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'нож', sentence: 'Я режу ножом.', translation: 'I cut with a knife.', targetPosition: 2, difficulty: 'beginner' },
  
  // вилка (fork)
  { word: 'вилка', sentence: 'Вилка на столе.', translation: 'The fork is on the table.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'вилка', sentence: 'Это моя вилка.', translation: 'This is my fork.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'вилка', sentence: 'Я ем вилкой.', translation: 'I eat with a fork.', targetPosition: 2, difficulty: 'beginner' },
  
  // тарелка (plate)
  { word: 'тарелка', sentence: 'Тарелка чистая.', translation: 'The plate is clean.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'тарелка', sentence: 'Еда на тарелке.', translation: 'Food is on the plate.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'тарелка', sentence: 'Это большая тарелка.', translation: 'This is a big plate.', targetPosition: 2, difficulty: 'beginner' },
  
  // ручка (pen)
  { word: 'ручка', sentence: 'Моя ручка синяя.', translation: 'My pen is blue.', targetPosition: 1, difficulty: 'beginner' },
  { word: 'ручка', sentence: 'Ручка на столе.', translation: 'The pen is on the table.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'ручка', sentence: 'Я пишу ручкой.', translation: 'I write with a pen.', targetPosition: 2, difficulty: 'beginner' },
  
  // карандаш (pencil)
  { word: 'карандаш', sentence: 'Это мой карандаш.', translation: 'This is my pencil.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'карандаш', sentence: 'Карандаш острый.', translation: 'The pencil is sharp.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'карандаш', sentence: 'Я рисую карандашом.', translation: 'I draw with a pencil.', targetPosition: 2, difficulty: 'beginner' },
  
  // путь (path/way)
  { word: 'путь', sentence: 'Путь длинный.', translation: 'The path is long.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'путь', sentence: 'Это мой путь.', translation: 'This is my way.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'путь', sentence: 'Я иду своим путём.', translation: 'I go my own way.', targetPosition: 2, difficulty: 'intermediate' },
  
  // свет (light)
  { word: 'свет', sentence: 'Свет яркий.', translation: 'The light is bright.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'свет', sentence: 'Включи свет!', translation: 'Turn on the light!', targetPosition: 1, difficulty: 'beginner' },
  { word: 'свет', sentence: 'Я вижу свет.', translation: 'I see the light.', targetPosition: 2, difficulty: 'beginner' },
  
  // цвет (color)
  { word: 'цвет', sentence: 'Какой твой любимый цвет?', translation: 'What is your favorite color?', targetPosition: 3, difficulty: 'beginner' },
  { word: 'цвет', sentence: 'Это красивый цвет.', translation: 'This is a beautiful color.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'цвет', sentence: 'Цвет яркий.', translation: 'The color is bright.', targetPosition: 0, difficulty: 'beginner' },
  
  // лист (leaf)
  { word: 'лист', sentence: 'Лист зелёный.', translation: 'The leaf is green.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'лист', sentence: 'Я вижу лист.', translation: 'I see the leaf.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'лист', sentence: 'Это осенний лист.', translation: 'This is an autumn leaf.', targetPosition: 2, difficulty: 'beginner' },
  
  // мост (bridge)
  { word: 'мост', sentence: 'Мост длинный.', translation: 'The bridge is long.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'мост', sentence: 'Я иду через мост.', translation: 'I walk across the bridge.', targetPosition: 3, difficulty: 'beginner' },
  { word: 'мост', sentence: 'Это большой мост.', translation: 'This is a big bridge.', targetPosition: 2, difficulty: 'beginner' },
  
  // гора (mountain)
  { word: 'гора', sentence: 'Гора высокая.', translation: 'The mountain is high.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'гора', sentence: 'Я вижу гору.', translation: 'I see the mountain.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'гора', sentence: 'Мы идём в гору.', translation: 'We are going up the mountain.', targetPosition: 3, difficulty: 'beginner' },
  
  // река (river)
  { word: 'река', sentence: 'Река широкая.', translation: 'The river is wide.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'река', sentence: 'Я вижу реку.', translation: 'I see the river.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'река', sentence: 'Это чистая река.', translation: 'This is a clean river.', targetPosition: 2, difficulty: 'beginner' },
  
  // озеро (lake)
  { word: 'озеро', sentence: 'Озеро глубокое.', translation: 'The lake is deep.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'озеро', sentence: 'Мы у озера.', translation: 'We are at the lake.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'озеро', sentence: 'Это большое озеро.', translation: 'This is a big lake.', targetPosition: 2, difficulty: 'beginner' },
  
  // село (village)
  { word: 'село', sentence: 'Село маленькое.', translation: 'The village is small.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'село', sentence: 'Я живу в селе.', translation: 'I live in a village.', targetPosition: 3, difficulty: 'beginner' },
  { word: 'село', sentence: 'Это тихое село.', translation: 'This is a quiet village.', targetPosition: 2, difficulty: 'beginner' },
  
  // место (place)
  { word: 'место', sentence: 'Это хорошее место.', translation: 'This is a good place.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'место', sentence: 'Место свободно.', translation: 'The place is free.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'место', sentence: 'Моё место здесь.', translation: 'My place is here.', targetPosition: 1, difficulty: 'beginner' },
  
  // поле (field)
  { word: 'поле', sentence: 'Поле зелёное.', translation: 'The field is green.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'поле', sentence: 'Я гуляю в поле.', translation: 'I walk in the field.', targetPosition: 3, difficulty: 'beginner' },
  { word: 'поле', sentence: 'Это большое поле.', translation: 'This is a big field.', targetPosition: 2, difficulty: 'beginner' },
  
  // число (number)
  { word: 'число', sentence: 'Это большое число.', translation: 'This is a big number.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'число', sentence: 'Число правильное.', translation: 'The number is correct.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'число', sentence: 'Я знаю это число.', translation: 'I know this number.', targetPosition: 3, difficulty: 'beginner' },
  
  // буква (letter)
  { word: 'буква', sentence: 'Это русская буква.', translation: 'This is a Russian letter.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'буква', sentence: 'Буква большая.', translation: 'The letter is big.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'буква', sentence: 'Я пишу букву.', translation: 'I write a letter.', targetPosition: 2, difficulty: 'beginner' },
  
  // звук (sound)
  { word: 'звук', sentence: 'Звук громкий.', translation: 'The sound is loud.', targetPosition: 0, difficulty: 'beginner' },
  { word: 'звук', sentence: 'Я слышу звук.', translation: 'I hear a sound.', targetPosition: 2, difficulty: 'beginner' },
  { word: 'звук', sentence: 'Это странный звук.', translation: 'This is a strange sound.', targetPosition: 2, difficulty: 'beginner' }
];

module.exports = {
  wordDefinitions,
  exampleSentences
};
