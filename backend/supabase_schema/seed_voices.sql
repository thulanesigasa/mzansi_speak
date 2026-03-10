INSERT INTO public.voices (id, name, gender, accent_region, description, recommended_speed) VALUES 
('am_adam', 'Thabo', 'Male', 'Gauteng', 'Deep male voice with confident delivery', 1.0),
('af_bella', 'Zanele', 'Female', 'KwaZulu-Natal', 'Clear and expressive female voice', 1.0),
('am_michael', 'Sipho', 'Male', 'Eastern Cape', 'Warm male voice with smooth tone', 0.95),
('af_sarah', 'Lindiwe', 'Female', 'Limpopo', 'Soft female voice with gentle cadence', 1.0),
('af_nicole', 'Nomsa', 'Female', 'Free State', 'Bright and articulate female voice', 1.0),
('af_sky', 'Ayanda', 'Female', 'Western Cape', 'Light and airy female voice', 1.0),
('bf_emma', 'Naledi', 'Female', 'North West', 'Polished female voice with crisp diction', 1.0),
('bf_isabella', 'Thandiwe', 'Female', 'Mpumalanga', 'Elegant female voice with rich timbre', 1.0),
('bm_george', 'Mandla', 'Male', 'Northern Cape', 'Authoritative male voice with clear enunciation', 1.0),
('bm_lewis', 'Kagiso', 'Male', 'Gauteng', 'Calm and measured male voice', 0.95)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    gender = EXCLUDED.gender,
    accent_region = EXCLUDED.accent_region,
    description = EXCLUDED.description,
    recommended_speed = EXCLUDED.recommended_speed;
