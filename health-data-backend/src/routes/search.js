// routes/search.js
const express = require("express");
const router = express.Router();
const fs = require("fs");

// Load seeded data
let healthDatasets = [];
try {
  healthDatasets = JSON.parse(
    fs.readFileSync("./data/seeded-health-data.json")
  );
} catch (error) {
  console.warn("No seeded data found. Run seedData.js first.");
}

// Search health data
router.get("/search", async (req, res) => {
  try {
    const {
      // Basic filters
      type,
      patientId,
      condition,
      dateFrom,
      dateTo,
      priceMin,
      priceMax,
      gender,
      ageRange,

      // Advanced filters
      valueRange, // 'min-max'
      hasNotes, // 'true' or 'false'
      multipleConditions, // 'cond1, cond2, cond3'

      // Sorting
      sortBy, // 'price', 'date', 'age', 'value'
      sortOrder, // 'asc' or 'desc'

      // Pagination
      page = 1,
      limit = 10,
    } = req.query;

    let results = [...healthDatasets];

    // Basic filters
    if (type) {
      results = results.filter((item) =>
        item.data.type.toLowerCase().includes(type.toLowerCase())
      );
    }

    if (patientId) {
      results = results.filter((item) => item.data.patientId === patientId);
    }

    if (condition) {
      results = results.filter((item) =>
        item.data.patientDetails.condition
          .toLowerCase()
          .includes(condition.toLowerCase())
      );
    }

    // Advanced filters
    if (multipleConditions) {
      const conditions = multipleConditions
        .split(",")
        .map((c) => c.trim().toLowerCase());
      results = results.filter((item) =>
        conditions.includes(item.data.patientDetails.condition.toLowerCase())
      );
    }

    // Date range filter
    if (dateFrom || dateTo) {
      results = results.filter((item) => {
        const itemDate = new Date(item.data.timestamp);
        if (dateFrom && new Date(dateFrom) > itemDate) return false;
        if (dateTo && new Date(dateTo) < itemDate) return false;
        return true;
      });
    }

    // Price range filter
    if (priceMin || priceMax) {
      results = results.filter((item) => {
        const price = parseFloat(item.price);
        if (priceMin && price < parseFloat(priceMin)) return false;
        if (priceMax && price > parseFloat(priceMax)) return false;
        return true;
      });
    }

    // Gender filter
    if (gender) {
      results = results.filter(
        (item) =>
          item.data.patientDetails.gender.toLowerCase() === gender.toLowerCase()
      );
    }

    // Age range filter
    if (ageRange) {
      const [minAge, maxAge] = ageRange.split("-").map(Number);
      results = results.filter((item) => {
        const age = item.data.patientDetails.age;
        return age >= minAge && age <= maxAge;
      });
    }

    // Value range filter
    if (valueRange) {
      const [minVal, maxVal] = valueRange.split("-").map(Number);
      results = results.filter((item) => {
        const value = parseFloat(item.data.value.split("/")[0]); // Get numerator
        return value >= minVal && value <= maxVal;
      });
    }

    // Notes filter
    if (hasNotes === "true" || hasNotes === "false") {
      results = results.filter(
        (item) => !!item.data.notes === (hasNotes === "true")
      );
    }

    // Sorting
    if (sortBy) {
      results.sort((a, b) => {
        let aVal, bVal;
        switch (sortBy) {
          case "price":
            aVal = parseFloat(a.price);
            bVal = parseFloat(b.price);
            break;
          case "date":
            aVal = new Date(a.data.timestamp);
            bVal = new Date(b.data.timestamp);
            break;
          case "age":
            aVal = a.data.patientDetails.age;
            bVal = b.data.patientDetails.age;
            break;
          case "value":
            aVal = parseFloat(a.data.value.split("/")[0]);
            bVal = parseFloat(b.data.value.split("/")[0]);
            break;
          default:
            return 0;
        }
        return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
      });
    }

    // Pagination
    const totalResults = results.length;
    const totalPages = Math.ceil(totalResults / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    results = results.slice(startIndex, endIndex);

    res.json({
      metadata: {
        total: totalResults,
        pages: totalPages,
        currentPage: parseInt(page),
        resultsPerPage: parseInt(limit),
      },
      results: results.map((item) => ({
        dataHash: item.dataHash,
        type: item.data.type,
        patientId: item.data.patientId,
        timestamp: item.data.timestamp,
        price: item.price,
        patientDetails: item.data.patientDetails,
        value: item.data.value,
        notes: item.data.notes,
      })),
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed", details: error.message });
  }
});

// Get health data by ID
router.get("/stats", async (req, res) => {
  try {
    const stats = {
      totalRecords: healthDatasets.length,
      byType: {},
      byCondition: {},
      byGender: {},
      pricing: {
        average: 0,
        min: Infinity,
        max: -Infinity,
        distribution: {
          "0-0.01": 0,
          "0.01-0.02": 0,
          "0.02-0.03": 0,
          "0.03-0.04": 0,
          "0.04+": 0,
        },
      },
      ageDistribution: {
        "20-30": 0,
        "31-40": 0,
        "41-50": 0,
        "51-60": 0,
        "60+": 0,
      },
      timeDistribution: {
        lastDay: 0,
        lastWeek: 0,
        lastMonth: 0,
      },
      valueRanges: {},
    };

    let totalPrice = 0;
    const now = new Date();

    healthDatasets.forEach((item) => {
      // Basic stats
      stats.byType[item.data.type] = (stats.byType[item.data.type] || 0) + 1;
      stats.byCondition[item.data.patientDetails.condition] =
        (stats.byCondition[item.data.patientDetails.condition] || 0) + 1;
      stats.byGender[item.data.patientDetails.gender] =
        (stats.byGender[item.data.patientDetails.gender] || 0) + 1;

      // Pricing stats
      const price = parseFloat(item.price);
      totalPrice += price;
      stats.pricing.min = Math.min(stats.pricing.min, price);
      stats.pricing.max = Math.max(stats.pricing.max, price);

      // Pricing distribution
      if (price <= 0.01) stats.pricing.distribution["0-0.01"]++;
      else if (price <= 0.02) stats.pricing.distribution["0.01-0.02"]++;
      else if (price <= 0.03) stats.pricing.distribution["0.02-0.03"]++;
      else if (price <= 0.04) stats.pricing.distribution["0.03-0.04"]++;
      else stats.pricing.distribution["0.04+"]++;

      // Age distribution
      const age = item.data.patientDetails.age;
      if (age <= 30) stats.ageDistribution["20-30"]++;
      else if (age <= 40) stats.ageDistribution["31-40"]++;
      else if (age <= 50) stats.ageDistribution["41-50"]++;
      else if (age <= 60) stats.ageDistribution["51-60"]++;
      else stats.ageDistribution["60+"]++;

      // Time distribution
      const itemDate = new Date(item.data.timestamp);
      const daysDiff = (now - itemDate) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 1) stats.timeDistribution.lastDay++;
      if (daysDiff <= 7) stats.timeDistribution.lastWeek++;
      if (daysDiff <= 30) stats.timeDistribution.lastMonth++;

      // Value ranges by type
      if (!stats.valueRanges[item.data.type]) {
        stats.valueRanges[item.data.type] = {
          min: Infinity,
          max: -Infinity,
          avg: 0,
          count: 0,
        };
      }
      const valueRange = stats.valueRanges[item.data.type];
      const value = parseFloat(item.data.value.split("/")[0]);
      valueRange.min = Math.min(valueRange.min, value);
      valueRange.max = Math.max(valueRange.max, value);
      valueRange.avg =
        (valueRange.avg * valueRange.count + value) / (valueRange.count + 1);
      valueRange.count++;
    });

    stats.pricing.average = totalPrice / healthDatasets.length;

    res.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    res
      .status(500)
      .json({ error: "Failed to get stats", details: error.message });
  }
});

module.exports = router;
