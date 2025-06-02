import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenPreproductoComponent } from './orden-preproducto.component';

describe('OrdenPreproductoComponent', () => {
  let component: OrdenPreproductoComponent;
  let fixture: ComponentFixture<OrdenPreproductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenPreproductoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenPreproductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
