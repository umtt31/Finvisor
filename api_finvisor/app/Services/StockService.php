<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class StockService
{
    protected $apiKey;
    protected $baseUrl = 'https://www.alphavantage.co/query';

    public function __construct()
    {
        $this->apiKey = config('services.alpha_vantage.key');
    }

    public function getQuote(string $symbol)
    {
        $cacheKey = "stock_quote_{$symbol}";

        return Cache::remember($cacheKey, 300, function () use ($symbol) {
            $response = Http::get($this->baseUrl, [
                'function' => 'GLOBAL_QUOTE',
                'symbol' => $symbol,
                'apikey' => $this->apiKey
            ]);

            return $response->json();
        });
    }

    public function searchStocks(string $keywords)
    {
        $cacheKey = "stock_search_{$keywords}";

        return Cache::remember($cacheKey, 3600, function () use ($keywords) {
            $response = Http::get($this->baseUrl, [
                'function' => 'SYMBOL_SEARCH',
                'keywords' => $keywords,
                'apikey' => $this->apiKey
            ]);

            return $response->json();
        });
    }

    public function getDailyData(string $symbol)
    {
        $cacheKey = "stock_daily_{$symbol}";

        return Cache::remember($cacheKey, 3600, function () use ($symbol) {
            $response = Http::get($this->baseUrl, [
                'function' => 'TIME_SERIES_DAILY',
                'symbol' => $symbol,
                'apikey' => $this->apiKey
            ]);

            return $response->json();
        });
    }
}
