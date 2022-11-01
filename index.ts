import { PrismaClient } from "@prisma/client";

const client = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "stdout",
      level: "error",
    },
    {
      emit: "stdout",
      level: "info",
    },
    {
      emit: "stdout",
      level: "warn",
    },
  ],
});

client.$on("query", (e) => {
  console.log("Query: " + e.query);
  console.log("Params: " + e.params);
  console.log("Duration: " + e.duration + "ms");
});

const SN = "SN01";

await client.sensor.deleteMany();
await client.port.deleteMany();
await client.station.deleteMany();

await client.sensor.create({
  data: {
    sn: SN,
  },
});

const firstStation = await client.station.create({
  data: {
    ports: {
      create: {
        index: 0,
      },
    },
  },
});

await client.port.upsert({
  where: {
    stationId_index: {
      index: 0,
      stationId: firstStation.id,
    },
  },
  create: {
    stationId: firstStation.id,
    index: 0,
    sensor: {
      connectOrCreate: {
        where: {
          sn: SN,
        },
        create: {
          sn: SN,
        },
      },
    },
  },
  update: {
    sensor: {
      connectOrCreate: {
        where: {
          sn: SN,
        },
        create: {
          sn: SN,
        },
      },
    },
  },
});
