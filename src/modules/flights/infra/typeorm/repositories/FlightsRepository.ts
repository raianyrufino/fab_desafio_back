import { getRepository, Repository } from 'typeorm';

import { startOfDay, isEqual, isAfter, addMinutes, parseISO } from 'date-fns';

import IFlightRepository from '@modules/flights/repositories/IFlightRepository';
import ICreateFlightDTO from '@modules/flights/dtos/ICreateFlightDTO';
import Flight from '../entities/Flight';

class FlightsRepository implements IFlightRepository {
  private ormRepository: Repository<Flight>;

  constructor() {
    this.ormRepository = getRepository(Flight);
  }

  public async all(): Promise<Flight[] | null> {
    const flights = this.ormRepository.find();

    return flights;
  }

  public async create({
    codigoVoo,
    data,
    destino_id,
    origem_id,
  }: ICreateFlightDTO): Promise<Flight> {
    const flight = this.ormRepository.create({
      codigoVoo,
      data,
      destino_id,
      origem_id,
    });

    await this.ormRepository.save(flight);

    return flight;
  }

  public async findByDestinyAndDay(
    destino_id: string,
    data: Date,
  ): Promise<Flight | undefined> {
    const allFlights = await this.ormRepository.find({
      where: { destino_id },
    });

    const findFlight = allFlights.find(flight => {
      if (isEqual(startOfDay(flight.data), startOfDay(data))) {
        return flight;
      }
    });

    return findFlight;
  }

  public async findByTimeOfFlight(data: Date): Promise<Flight | undefined> {
    const allFlights = await this.ormRepository.find();

    const findFlight = allFlights.find(flight => {
      if (isEqual(startOfDay(flight.data), startOfDay(data))) {
        if (!isAfter(data, addMinutes(flight.data, 30))) {
          return flight;
        }
      }
    });

    return findFlight;
  }
}

export default FlightsRepository;
