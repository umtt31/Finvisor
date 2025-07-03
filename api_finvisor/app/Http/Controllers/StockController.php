<?php

namespace App\Http\Controllers;

use App\Models\StockDailyModel;
use App\Models\StockQuoteModel;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;

class StockController extends Controller
{
    protected $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    public function getQuote(): JsonResponse
    {
        $symbols = [
            "MSFT",
            "NVDA",
            "AAPL",
            "AMZN",
            "GOOGL",
            "META",
            "TSLA",
            "ORCL",
            "NFLX",
            "JPM",
        ];

        $stockImages = [
            "MSFT" => "https://cdn.investing.com/entities-logos/21835.svg",
            "NVDA" => "https://cdn.investing.com/entities-logos/32307.svg",
            "AAPL" => "https://cdn.investing.com/entities-logos/24937.svg",
            "AMZN" => "https://cdn.investing.com/entities-logos/18749.svg",
            "GOOGL" => "https://cdn.investing.com/entities-logos/29096.svg",
            "META" => "https://cdn.investing.com/entities-logos/20765463.svg",
            "TSLA" => "https://cdn.investing.com/entities-logos/27444752.svg",
            "ORCL" => "https://cdn.investing.com/entities-logos/22247.svg",
            "NFLX" => "https://cdn.investing.com/entities-logos/32012.svg",
            "JPM" => "https://cdn.investing.com/entities-logos/658776.svg",
        ];

        $data = [];
        foreach ($symbols as $symbol) {
            $quoteModel = new StockQuoteModel();

            if (!$quoteModel->isQuoteExistsToday($symbol)) {
                $stockData = $this->stockService->getQuote($symbol);

                $quoteModel->updateOrCreate(
                    [
                        "symbol" => $symbol,
                    ],
                    [
                        "open" => $stockData["Global Quote"]["02. open"],
                        "high" => $stockData["Global Quote"]["03. high"],
                        "low" => $stockData["Global Quote"]["04. low"],
                        "price" => $stockData["Global Quote"]["05. price"],
                        "volume" => $stockData["Global Quote"]["06. volume"],
                        "latest_trading_day" => $stockData["Global Quote"]["07. latest trading day"],
                        "previous_close" => $stockData["Global Quote"]["08. previous close"],
                        "change" => $stockData["Global Quote"]["09. change"],
                        "change_percent" => $stockData["Global Quote"]["10. change percent"],
                        "date" => now()->format('Y-m-d'),
                    ]
                );

                $data[] = [
                    "symbol" => $symbol,
                    "open" => $stockData["Global Quote"]["02. open"],
                    "high" => $stockData["Global Quote"]["03. high"],
                    "low" => $stockData["Global Quote"]["04. low"],
                    "price" => $stockData["Global Quote"]["05. price"],
                    "volume" => $stockData["Global Quote"]["06. volume"],
                    "latest_trading_day" => $stockData["Global Quote"]["07. latest trading day"],
                    "previous_close" => $stockData["Global Quote"]["08. previous close"],
                    "change" => $stockData["Global Quote"]["09. change"],
                    "change_percent" => $stockData["Global Quote"]["10. change percent"],
                    "date" => now()->format('Y-m-d'),
                    "image" => $stockImages[$symbol],
                ];
            } else {
                $stockData = $quoteModel->getQuote($symbol)->first();
                $data[] = [
                    "symbol" => $symbol,
                    "open" => $stockData->open,
                    "high" => $stockData->high,
                    "low" => $stockData->low,
                    "price" => $stockData->price,
                    "volume" => $stockData->volume,
                    "latest_trading_day" => $stockData->latest_trading_day,
                    "previous_close" => $stockData->previous_close,
                    "change" => $stockData->change,
                    "change_percent" => $stockData->change_percent,
                    "date" => $stockData->date,
                    "image" => $stockImages[$symbol],
                ];
            }
        }

        return response()->json($data);
    }

    public function getDailyData(string $symbol): JsonResponse
    {
        $dailyModel = new StockDailyModel();

        $symbol = strtoupper($symbol);

        $stockImages = [
            "MSFT" => "https://www.investing.com/equities/microsoft-corp",
            "NVDA" => "https://cdn.investing.com/entities-logos/32307.svg",
            "AAPL" => "https://cdn.investing.com/entities-logos/24937.svg",
            "AMZN" => "https://cdn.investing.com/entities-logos/18749.svg",
            "GOOGL" => "https://cdn.investing.com/entities-logos/29096.svg",
            "META" => "https://cdn.investing.com/entities-logos/20765463.svg",
            "TSLA" => "https://cdn.investing.com/entities-logos/27444752.svg",
            "ORCL" => "https://cdn.investing.com/entities-logos/22247.svg",
            "NFLX" => "https://cdn.investing.com/entities-logos/32012.svg",
            "JPM" => "https://cdn.investing.com/entities-logos/658776.svg",
        ];

        if (!$dailyModel->isDailyDataExistsToday($symbol)) {
            $stockData = $this->stockService->getDailyData($symbol);

            foreach ($stockData["Time Series (Daily)"] as $date => $data) {
                $dailyModel->updateOrCreate([
                    "symbol" => $symbol,
                    "date" => $date,
                ], [
                    "symbol" => $symbol,
                    "date" => $date,
                    "open" => $data["1. open"],
                    "high" => $data["2. high"],
                    "low" => $data["3. low"],
                    "close" => $data["4. close"],
                    "volume" => $data["5. volume"],
                ]);
            }

            $stockData = $dailyModel->getDailyData($symbol);
            $formattedData = [];
            foreach ($stockData as $data) {
                $formattedData[] = [
                    "symbol" => strtoupper($symbol),
                    "date" => $data->date,
                    "open" => $data->open,
                    "high" => $data->high,
                    "low" => $data->low,
                    "close" => $data->close,
                    "volume" => $data->volume,
                    "image" => $stockImages[$symbol],
                ];
            }
            return response()->json($formattedData);
        } else {
            $stockData = $dailyModel->getDailyData($symbol);
            $formattedData = [];
            foreach ($stockData as $data) {
                $formattedData[] = [
                    "symbol" => strtoupper($symbol),
                    "date" => $data->date,
                    "open" => $data->open,
                    "high" => $data->high,
                    "low" => $data->low,
                    "close" => $data->close,
                    "volume" => $data->volume,
                    "image" => $stockImages[$symbol],
                ];
            }
            return response()->json($formattedData);
        }
    }
}
