import { TestBed } from '@angular/core/testing';

import { HelloWorldService } from './greenl8web.service';

describe('Greenl8webService', () => {
  let service: HelloWorldService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HelloWorldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
