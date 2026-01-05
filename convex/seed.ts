/**
 * Database Seed Script for Should I Wait App
 *
 * Seeds the database with sample bathroom locations in major US cities.
 * This script is idempotent - can be run multiple times safely.
 *
 * Usage:
 *   npx convex run seed:seedBathrooms
 *
 * To clear and re-seed:
 *   npx convex run seed:clearAll
 *   npx convex run seed:seedBathrooms
 */

import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Sample bathroom locations across major US cities
 */
/**
 * Helper function to determine timezone from city name in address
 */
function getTimezoneFromAddress(address: string): string {
  if (address.includes("San Francisco") || address.includes("Los Angeles") || address.includes("Santa Monica") || address.includes("Seattle")) {
    return "America/Los_Angeles";
  }
  if (address.includes("New York") || address.includes("Brooklyn")) {
    return "America/New_York";
  }
  if (address.includes("Chicago")) {
    return "America/Chicago";
  }
  return "America/Los_Angeles"; // Default
}

/**
 * Helper function to determine place type from name/address
 */
function getPlaceType(name: string): string {
  if (name.toLowerCase().includes("park")) return "park";
  if (name.toLowerCase().includes("library")) return "library";
  if (name.toLowerCase().includes("museum")) return "museum";
  if (name.toLowerCase().includes("market")) return "market";
  if (name.toLowerCase().includes("mall") || name.toLowerCase().includes("center")) return "shopping_mall";
  if (name.toLowerCase().includes("airport") || name.toLowerCase().includes("terminal")) return "airport";
  if (name.toLowerCase().includes("pier") || name.toLowerCase().includes("wharf")) return "tourist_attraction";
  return "public_restroom"; // Default
}

const BATHROOM_LOCATIONS = [
  // San Francisco, CA (15 locations)
  {
    name: "Ferry Building Marketplace",
    address: "1 Ferry Building, San Francisco, CA 94111",
    latitude: 37.7956,
    longitude: -122.3933,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Well-Lit", "Clean"],
  },
  {
    name: "Golden Gate Park Visitor Center",
    address: "501 Stanyan St, San Francisco, CA 94117",
    latitude: 37.7694,
    longitude: -122.4862,
    amenities: ["Wheelchair Accessible", "Baby Changing Station"],
  },
  {
    name: "Westfield San Francisco Centre",
    address: "865 Market St, San Francisco, CA 94103",
    latitude: 37.7844,
    longitude: -122.4065,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Family Restroom", "Well-Lit"],
  },
  {
    name: "Coit Tower Parking Lot",
    address: "1 Telegraph Hill Blvd, San Francisco, CA 94133",
    latitude: 37.8024,
    longitude: -122.4058,
    amenities: ["Wheelchair Accessible", "Scenic View"],
  },
  {
    name: "AT&T Park (Oracle Park)",
    address: "24 Willie Mays Plaza, San Francisco, CA 94107",
    latitude: 37.7786,
    longitude: -122.3893,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Family Restroom", "Clean"],
  },
  {
    name: "San Francisco Public Library (Main)",
    address: "100 Larkin St, San Francisco, CA 94102",
    latitude: 37.7789,
    longitude: -122.4161,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Well-Lit", "Quiet"],
  },
  {
    name: "Ghirardelli Square",
    address: "900 North Point St, San Francisco, CA 94109",
    latitude: 37.8055,
    longitude: -122.4226,
    amenities: ["Wheelchair Accessible", "Clean", "Tourist Spot"],
  },
  {
    name: "Pier 39 Fisherman's Wharf",
    address: "Pier 39, San Francisco, CA 94133",
    latitude: 37.8087,
    longitude: -122.4098,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "High Traffic"],
  },
  {
    name: "de Young Museum",
    address: "50 Hagiwara Tea Garden Dr, San Francisco, CA 94118",
    latitude: 37.7715,
    longitude: -122.4686,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Clean", "Art Museum"],
  },
  {
    name: "Alamo Square Park",
    address: "Steiner St &, Hayes St, San Francisco, CA 94117",
    latitude: 37.7765,
    longitude: -122.4340,
    amenities: ["Wheelchair Accessible", "Outdoor"],
  },
  {
    name: "Union Square Parking Garage",
    address: "333 Post St, San Francisco, CA 94108",
    latitude: 37.7879,
    longitude: -122.4074,
    amenities: ["Wheelchair Accessible", "24/7 Access", "Underground"],
  },
  {
    name: "Chinatown Gate Plaza",
    address: "Grant Ave & Bush St, San Francisco, CA 94108",
    latitude: 37.7906,
    longitude: -122.4053,
    amenities: ["Wheelchair Accessible", "High Traffic"],
  },
  {
    name: "Lands End Lookout",
    address: "680 Point Lobos Ave, San Francisco, CA 94121",
    latitude: 37.7809,
    longitude: -122.5113,
    amenities: ["Wheelchair Accessible", "Scenic View", "Hiking Trails"],
  },
  {
    name: "Mission Dolores Park",
    address: "19th St & Dolores St, San Francisco, CA 94114",
    latitude: 37.7597,
    longitude: -122.4273,
    amenities: ["Wheelchair Accessible", "Outdoor", "Park"],
  },
  {
    name: "Embarcadero Center",
    address: "1 Embarcadero Center, San Francisco, CA 94111",
    latitude: 37.7946,
    longitude: -122.3988,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Shopping Mall"],
  },

  // New York City, NY (10 locations)
  {
    name: "Grand Central Terminal",
    address: "89 E 42nd St, New York, NY 10017",
    latitude: 40.7527,
    longitude: -73.9772,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "24/7 Access", "Historic"],
  },
  {
    name: "Times Square Visitor Center",
    address: "1560 Broadway, New York, NY 10036",
    latitude: 40.7580,
    longitude: -73.9855,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Tourist Spot"],
  },
  {
    name: "Central Park Conservatory Garden",
    address: "1048 5th Ave, New York, NY 10028",
    latitude: 40.7942,
    longitude: -73.9526,
    amenities: ["Wheelchair Accessible", "Outdoor", "Park"],
  },
  {
    name: "Bryant Park",
    address: "42nd St & 6th Ave, New York, NY 10018",
    latitude: 40.7536,
    longitude: -73.9832,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Well-Lit", "Clean"],
  },
  {
    name: "Brookfield Place (formerly World Financial Center)",
    address: "230 Vesey St, New York, NY 10281",
    latitude: 40.7130,
    longitude: -74.0151,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Family Restroom", "Shopping Mall"],
  },
  {
    name: "The High Line (14th Street Entrance)",
    address: "820 Washington St, New York, NY 10014",
    latitude: 40.7430,
    longitude: -74.0068,
    amenities: ["Wheelchair Accessible", "Outdoor", "Park"],
  },
  {
    name: "New York Public Library (Main Branch)",
    address: "476 5th Ave, New York, NY 10018",
    latitude: 40.7532,
    longitude: -73.9822,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Quiet", "Historic"],
  },
  {
    name: "Chelsea Market",
    address: "75 9th Ave, New York, NY 10011",
    latitude: 40.7424,
    longitude: -74.0061,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Food Hall"],
  },
  {
    name: "Brooklyn Bridge Park",
    address: "334 Furman St, Brooklyn, NY 11201",
    latitude: 40.6974,
    longitude: -73.9969,
    amenities: ["Wheelchair Accessible", "Outdoor", "Scenic View"],
  },
  {
    name: "Whole Foods Union Square",
    address: "4 Union Square South, New York, NY 10003",
    latitude: 40.7354,
    longitude: -73.9910,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Grocery Store"],
  },

  // Los Angeles, CA (5 locations)
  {
    name: "The Grove Shopping Center",
    address: "189 The Grove Dr, Los Angeles, CA 90036",
    latitude: 33.0389,
    longitude: -118.3553,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Family Restroom", "Shopping Mall"],
  },
  {
    name: "Griffith Observatory",
    address: "2800 E Observatory Rd, Los Angeles, CA 90027",
    latitude: 34.1184,
    longitude: -118.3004,
    amenities: ["Wheelchair Accessible", "Scenic View", "Tourist Spot"],
  },
  {
    name: "Santa Monica Pier",
    address: "200 Santa Monica Pier, Santa Monica, CA 90401",
    latitude: 34.0095,
    longitude: -118.4977,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Tourist Spot", "Beach"],
  },
  {
    name: "LAX Airport Terminal 1",
    address: "1 World Way, Los Angeles, CA 90045",
    latitude: 33.9425,
    longitude: -118.4081,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "24/7 Access", "Airport"],
  },
  {
    name: "Grand Central Market",
    address: "317 S Broadway, Los Angeles, CA 90013",
    latitude: 34.0502,
    longitude: -118.2486,
    amenities: ["Wheelchair Accessible", "Food Hall", "Historic"],
  },

  // Chicago, IL (5 locations)
  {
    name: "Millennium Park Cloud Gate",
    address: "201 E Randolph St, Chicago, IL 60602",
    latitude: 41.8826,
    longitude: -87.6233,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Tourist Spot", "Park"],
  },
  {
    name: "Navy Pier",
    address: "600 E Grand Ave, Chicago, IL 60611",
    latitude: 41.8918,
    longitude: -87.6051,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Tourist Spot"],
  },
  {
    name: "Willis Tower Skydeck",
    address: "233 S Wacker Dr, Chicago, IL 60606",
    latitude: 41.8789,
    longitude: -87.6359,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Skyscraper"],
  },
  {
    name: "Lincoln Park Zoo",
    address: "2001 N Clark St, Chicago, IL 60614",
    latitude: 41.9212,
    longitude: -87.6338,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Family Restroom", "Zoo"],
  },
  {
    name: "Chicago Riverwalk",
    address: "McCormick Bridgehouse, Chicago, IL 60601",
    latitude: 41.8879,
    longitude: -87.6200,
    amenities: ["Wheelchair Accessible", "Scenic View", "Outdoor"],
  },

  // Seattle, WA (3 locations)
  {
    name: "Pike Place Market",
    address: "85 Pike St, Seattle, WA 98101",
    latitude: 47.6097,
    longitude: -122.3421,
    amenities: ["Wheelchair Accessible", "Tourist Spot", "Market"],
  },
  {
    name: "Space Needle",
    address: "400 Broad St, Seattle, WA 98109",
    latitude: 47.6205,
    longitude: -122.3493,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Tourist Spot"],
  },
  {
    name: "Seattle Central Library",
    address: "1000 4th Ave, Seattle, WA 98104",
    latitude: 47.6062,
    longitude: -122.3321,
    amenities: ["Wheelchair Accessible", "Baby Changing Station", "Quiet", "Modern Architecture"],
  },
];

/**
 * Internal mutation to insert a single bathroom location
 * (Must be internal to avoid authentication requirements during seeding)
 */
export const insertLocation = internalMutation({
  args: {
    name: v.string(),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    amenities: v.array(v.string()),
    placeType: v.string(),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if location already exists (by name and address to avoid duplicates)
    const existing = await ctx.db
      .query("locations")
      .filter((q) =>
        q.and(
          q.eq(q.field("name"), args.name),
          q.eq(q.field("address"), args.address)
        )
      )
      .first();

    if (existing) {
      console.log(`Skipping duplicate: ${args.name}`);
      return { skipped: true, id: existing._id };
    }

    const now = Date.now();

    const locationId = await ctx.db.insert("locations", {
      name: args.name,
      address: args.address,
      latitude: args.latitude,
      longitude: args.longitude,
      amenities: args.amenities,
      placeType: args.placeType,
      timezone: args.timezone,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`Inserted: ${args.name}`);
    return { skipped: false, id: locationId };
  },
});

/**
 * Action to seed all bathroom locations
 * Run with: npx convex run seed:seedBathrooms
 */
export const seedBathrooms = action({
  args: {},
  handler: async (ctx) => {
    console.log(`Starting database seed...`);
    console.log(`Total bathrooms to seed: ${BATHROOM_LOCATIONS.length}`);

    let inserted = 0;
    let skipped = 0;

    for (const location of BATHROOM_LOCATIONS) {
      // Automatically add placeType and timezone
      const locationWithMetadata = {
        ...location,
        placeType: getPlaceType(location.name),
        timezone: getTimezoneFromAddress(location.address),
      };

      const result = await ctx.runMutation(internal.seed.insertLocation, locationWithMetadata);

      if (result.skipped) {
        skipped++;
      } else {
        inserted++;
      }
    }

    console.log(`Seed complete!`);
    console.log(`- Inserted: ${inserted} new bathrooms`);
    console.log(`- Skipped: ${skipped} duplicates`);
    console.log(`- Total: ${inserted + skipped} bathrooms in database`);

    return {
      success: true,
      inserted,
      skipped,
      total: inserted + skipped,
    };
  },
});

/**
 * Internal mutation to clear all data from a table
 */
const clearTable = internalMutation({
  args: {
    tableName: v.string(),
  },
  handler: async (ctx, args) => {
    const tableName = args.tableName as "locations" | "ratings" | "reviewVotes" | "photos" | "cleanlinessInsights";

    const allRecords = await ctx.db.query(tableName).collect();

    for (const record of allRecords) {
      await ctx.db.delete(record._id);
    }

    console.log(`Cleared ${allRecords.length} records from ${tableName}`);
    return allRecords.length;
  },
});

/**
 * Action to clear all database tables
 * WARNING: This deletes ALL data!
 * Run with: npx convex run seed:clearAll
 */
export const clearAll = action({
  args: {},
  handler: async (ctx) => {
    console.log("WARNING: Clearing all database tables...");

    const tables = ["reviewVotes", "ratings", "photos", "cleanlinessInsights", "locations"];
    let totalDeleted = 0;

    for (const tableName of tables) {
      const count = await ctx.runMutation(internal.seed.clearTable, { tableName });
      totalDeleted += count;
    }

    console.log(`Clear complete! Deleted ${totalDeleted} total records.`);

    return {
      success: true,
      deleted: totalDeleted,
      tables: tables,
    };
  },
});
