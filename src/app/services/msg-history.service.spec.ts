import { TestBed } from '@angular/core/testing';

import { MsgHistoryService } from './msg-history.service';

describe('MsgHistoryService', () => {
  let service: MsgHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MsgHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
