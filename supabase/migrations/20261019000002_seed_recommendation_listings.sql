-- Test catalog for exercising category-based recommendations.
-- Each row is assigned to an existing app user in round-robin order.

with sellers as (
  select
    user_id,
    row_number() over (order by created_at, user_id) as seller_number,
    count(*) over () as seller_count
  from public."app-users"
),
sample_listings(item_number, title, description, price, category) as (
  values
    (1, 'Wireless Noise-Canceling Headphones', 'Over-ear headphones with charging cable and carrying case.', 65.00, 'electronics'),
    (2, '27-Inch Computer Monitor', 'Full HD monitor with HDMI cable and adjustable stand.', 90.00, 'electronics'),
    (3, 'Mechanical Gaming Keyboard', 'Compact mechanical keyboard with backlighting.', 42.00, 'electronics'),
    (4, 'USB-C Laptop Dock', 'Dock with HDMI, Ethernet, USB, and SD card ports.', 38.00, 'electronics'),
    (5, 'Portable Bluetooth Speaker', 'Small water-resistant speaker with strong battery life.', 28.00, 'electronics'),
    (6, 'Graphing Calculator', 'TI-style graphing calculator suitable for calculus courses.', 48.00, 'electronics'),
    (7, 'LED Desk Lamp with Charger', 'Adjustable lamp with multiple brightness settings and USB charging.', 20.00, 'electronics'),
    (8, 'Compact Photo Printer', 'Portable color photo printer with a starter paper pack.', 52.00, 'electronics'),

    (9, 'Calculus Early Transcendentals', 'Used calculus textbook with light highlighting.', 35.00, 'textbooks'),
    (10, 'General Chemistry Textbook', 'Chemistry textbook with practice problems and solutions.', 30.00, 'textbooks'),
    (11, 'Introduction to Psychology', 'Clean introductory psychology textbook in good condition.', 24.00, 'textbooks'),
    (12, 'Biology Laboratory Manual', 'Lab manual with unused worksheet pages.', 18.00, 'textbooks'),
    (13, 'Data Structures and Algorithms', 'Computer science textbook with minimal markings.', 40.00, 'textbooks'),
    (14, 'Principles of Microeconomics', 'Recent edition with study guide included.', 27.00, 'textbooks'),
    (15, 'College Writing Handbook', 'Compact writing and citation reference guide.', 12.00, 'textbooks'),
    (16, 'Organic Chemistry Study Guide', 'Practice-focused study guide with answer key.', 22.00, 'textbooks'),

    (17, 'Adjustable Rolling Desk Chair', 'Supportive desk chair with adjustable height.', 55.00, 'furniture'),
    (18, 'Three-Drawer Storage Cart', 'Plastic rolling cart that fits beneath a dorm desk.', 25.00, 'furniture'),
    (19, 'Bedside Storage Table', 'Small wood-look side table with a lower shelf.', 32.00, 'furniture'),
    (20, 'Folding Study Desk', 'Compact folding desk suitable for small rooms.', 45.00, 'furniture'),
    (21, 'Cube Storage Organizer', 'Six-cube organizer with three fabric bins.', 36.00, 'furniture'),
    (22, 'Floor Reading Lamp', 'Tall standing lamp with an adjustable reading head.', 26.00, 'furniture'),
    (23, 'Dorm Lounge Chair', 'Foldable cushioned chair in dark gray.', 40.00, 'furniture'),
    (24, 'Under-Bed Storage Drawers', 'Pair of rolling storage drawers for a lofted bed.', 30.00, 'furniture'),

    (25, 'Twin XL Comforter Set', 'Comforter and matching pillow sham, freshly washed.', 34.00, 'dorm_supplies'),
    (26, 'Memory Foam Mattress Topper', 'Twin XL two-inch mattress topper with cover.', 46.00, 'dorm_supplies'),
    (27, 'Shower Caddy Bundle', 'Mesh shower caddy with hooks and toiletry containers.', 14.00, 'dorm_supplies'),
    (28, 'Laundry Hamper with Wheels', 'Collapsible hamper with wheels and handles.', 18.00, 'dorm_supplies'),
    (29, 'Command Hook Variety Pack', 'Unopened assortment of removable wall hooks.', 10.00, 'dorm_supplies'),
    (30, 'Blackout Curtain Pair', 'Two blackout curtain panels with tension rod.', 24.00, 'dorm_supplies'),
    (31, 'Dorm Room Area Rug', 'Soft washable rug sized for a dorm room.', 29.00, 'dorm_supplies'),
    (32, 'Clip-On Bedside Shelf', 'Shelf attaches to a lofted bed frame without tools.', 19.00, 'dorm_supplies'),

    (33, 'University Hoodie', 'Maroon campus hoodie in medium, gently worn.', 25.00, 'clothing'),
    (34, 'Waterproof Rain Jacket', 'Lightweight unisex rain jacket in large.', 32.00, 'clothing'),
    (35, 'Business Casual Blazer', 'Navy blazer suitable for interviews and career fairs.', 38.00, 'clothing'),
    (36, 'Winter Coat', 'Warm black winter coat with removable hood.', 48.00, 'clothing'),
    (37, 'Campus T-Shirt Bundle', 'Three university T-shirts in size small.', 20.00, 'clothing'),
    (38, 'Running Shoes', 'Lightly used running shoes, size 9.', 35.00, 'clothing'),
    (39, 'Graduation Gown', 'Black graduation gown and cap in excellent condition.', 30.00, 'clothing'),
    (40, 'Professional Dress Shoes', 'Black dress shoes suitable for interviews, size 10.', 28.00, 'clothing'),

    (41, 'Compact Mini Fridge', 'Clean mini fridge with a small freezer compartment.', 72.00, 'other'),
    (42, '700-Watt Microwave', 'Compact microwave with rotating glass tray.', 45.00, 'other'),
    (43, 'Single-Serve Coffee Maker', 'Coffee maker with reusable filter and travel mug.', 24.00, 'other'),
    (44, 'Electric Kettle', 'Fast-boil kettle with automatic shutoff.', 18.00, 'other'),
    (45, 'Box Fan', 'Three-speed box fan in good working condition.', 16.00, 'other'),
    (46, 'Basic Tool Kit', 'Compact tool kit with screwdriver bits, hammer, and pliers.', 22.00, 'other'),
    (47, 'Dry-Erase Calendar', 'Large monthly wall calendar with markers.', 12.00, 'other'),
    (48, 'Yoga Mat and Blocks', 'Exercise mat with two foam yoga blocks.', 20.00, 'other'),
    (49, 'Insulated Water Bottle', 'Stainless steel 32-ounce bottle with straw lid.', 15.00, 'other'),
    (50, 'Board Game Bundle', 'Three party and strategy games with all pieces included.', 26.00, 'other')
)
insert into public.listings (
  seller_id,
  title,
  description,
  price,
  category,
  status,
  created_at
)
select
  sellers.user_id,
  sample_listings.title,
  sample_listings.description,
  sample_listings.price,
  sample_listings.category,
  'active',
  now() - make_interval(hours => sample_listings.item_number * 3)
from sample_listings
join sellers
  on sellers.seller_number = ((sample_listings.item_number - 1) % sellers.seller_count) + 1;
