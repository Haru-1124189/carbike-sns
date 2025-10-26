module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // クエリパラメータから都市名を取得（デフォルト: 熊本市）
    const cityName = req.query.city || '熊本市';
    const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!openWeatherApiKey) {
      console.error('OpenWeatherMap API設定が見つかりません');
      return res.status(500).json({
        success: false,
        error: 'OpenWeatherMap API configuration not found'
      });
    }

    console.log(`OpenWeatherMap APIから${cityName}の天気情報を取得開始`);

    // 都市IDを取得（Google Maps APIで緯度経度を取得してからOpenWeatherMapで検索）
    // または、直接都市名で検索
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${openWeatherApiKey}`;
    
    const geocodeResponse = await fetch(geocodeUrl);
    
    if (!geocodeResponse.ok) {
      console.error(`Geocoding API エラー: ${geocodeResponse.status}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to get city coordinates'
      });
    }

    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData || geocodeData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'City not found'
      });
    }

    const { lat, lon } = geocodeData[0];
    
    // 現在の天気を取得
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric&lang=ja`;
    
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      console.error(`Weather API エラー: ${weatherResponse.status}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to get weather data'
      });
    }

    const weatherData = await weatherResponse.json();

    // 天気情報を整形
    const result = {
      success: true,
      city: cityName,
      temperature: Math.round(weatherData.main.temp),
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind?.speed || 0,
      feelsLike: Math.round(weatherData.main.feels_like),
      updatedAt: new Date().toISOString()
    };

    console.log(`${cityName}の天気情報を取得成功`);

    res.status(200).json(result);

  } catch (error) {
    console.error('Error in weather API:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data'
    });
  }
};
