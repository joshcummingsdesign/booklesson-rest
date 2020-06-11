import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities';
import { AvailabilityService } from './availability.service';
import { mockAvailabilityRepository } from './__mocks__/availability.repository';
import {
  teacher,
  availability,
  addAvailabilityDto,
  availabilities,
} from '../__fixtures__';

describe('AvailabilityService', () => {
  let availabilityService: AvailabilityService;
  let availabilityRepository: Repository<Availability>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: getRepositoryToken(Availability),
          useFactory: mockAvailabilityRepository,
        },
      ],
    }).compile();

    availabilityService = module.get<AvailabilityService>(AvailabilityService);
    availabilityRepository = module.get<Repository<Availability>>(
      getRepositoryToken(Availability),
    );
  });

  describe('create', () => {
    it('should create an availability', async () => {
      jest.spyOn(availabilityRepository, 'save');

      expect(
        await availabilityService.create(teacher.id, addAvailabilityDto),
      ).toBe(availability);
      expect(availabilityRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should find all availabilities', async () => {
      expect(await availabilityService.findAll(teacher.id)).toBe(
        availabilities,
      );
      expect(availabilityRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should find an availability by id', async () => {
      expect(
        await availabilityService.findOne(teacher.id, availability.id),
      ).toBe(availability);
      expect(availabilityRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw if availability not found', () => {
      jest
        .spyOn(availabilityRepository, 'findOne')
        .mockResolvedValue(undefined);

      expect(
        availabilityService.findOne(teacher.id, availability.id),
      ).rejects.toThrow('Availability not found');
    });
  });

  describe('delete', () => {
    it('should delete an availability', async () => {
      jest.spyOn(availabilityService, 'findOne');

      expect(
        await availabilityService.delete(teacher.id, availability.id),
      ).toBe(availability);
      expect(availabilityService.findOne).toHaveBeenCalledTimes(1);
      expect(availabilityRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
