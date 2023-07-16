import { Inject, Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsRepository } from './reservations.repository';
import { PAYMENTS_SERVICE } from '@app/common/constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { map } from 'rxjs';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    @Inject(PAYMENTS_SERVICE) private readonly paymentsService: ClientProxy,
  ){}

  async create(createReservationDto: CreateReservationDto, userId: string) {
    return this.paymentsService.send(
      'create_charge',
      createReservationDto.charge
    ).pipe(
      map((res) => {
        return this.reservationsRepository.create({
          ...createReservationDto,
          invoiceId: res.id,
          timestamp: new Date(),
          userId
        });
      })
    );

  }

  async findAll() {
    return this.reservationsRepository.findAll({});
  }

  async findOne(_id: string) {
    return this.reservationsRepository.findOne({ _id });
  }

  async update(_id: string, updateReservationDto: UpdateReservationDto) {
    return this.reservationsRepository.findOneAndUpdate(
      { _id}, 
      { $set: updateReservationDto },
    );
  }

  async remove(_id: string) {
    return this.reservationsRepository.filterOneAndDelete({ _id });
  }
}
