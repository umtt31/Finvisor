<?php

namespace App\Http\Controllers;

use App\Models\AnalysisModel;

class AnalysisController extends Controller
{
    public function getAnalysis($date)
    {
        $analysis = AnalysisModel::where('date', $date)->first();
        if (!$analysis) {
            return response()->json([
                'error' => 'Analysis not found'
            ], 404);
        }
        return response()->json($analysis);
    }
}
