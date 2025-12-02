"""
Topaz-VBE Business Management Simulation
Complete implementation matching the official manual specifications
"""
import math
import random
from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional
from collections import defaultdict
import numpy as np
import pandas as pd

# ============================================================================
# CONSTANTS FROM MANUAL TABLES
# ============================================================================

PRODUCTS = ["Product 1", "Product 2", "Product 3"]
AREAS = ["South", "West", "North", "Export"]

# Table 1: Market Statistics
MARKET_STATISTICS = {
    "South": {"managerial": 1_000_000, "supervisory": 2_000_000, "other": 4_000_000, "total": 7_000_000, "outlets": 3000},
    "West": {"managerial": 1_000_000, "supervisory": 1_000_000, "other": 2_000_000, "total": 4_000_000, "outlets": 2000},
    "North": {"managerial": 1_000_000, "supervisory": 3_000_000, "other": 9_000_000, "total": 13_000_000, "outlets": 4000},
    "Export": {"managerial": 10_000_000, "supervisory": 15_000_000, "other": 55_000_000, "total": 80_000_000, "outlets": 20_000},
}

# Table 2: Marketing Costs
SALESPERSON_EXPENSES = 3000  # per quarter
COMPETITOR_INFO_COST = 5000  # per quarter
MARKET_SHARES_INFO_COST = 5000  # per quarter

# Table 3: Manufacturing Parameters
MIN_MACHINING_TIME = {"Product 1": 60.0, "Product 2": 75.0, "Product 3": 120.0}  # minutes
MIN_ASSEMBLY_TIME = {"Product 1": 100.0, "Product 2": 150.0, "Product 3": 300.0}  # minutes
MATERIAL_PER_UNIT = {"Product 1": 1.0, "Product 2": 2.0, "Product 3": 3.0}  # units

# Table 4: Maintenance Costs
CONTRACTED_MAINTENANCE_RATE = 60.0  # £ per hour
UNCONTRACTED_MAINTENANCE_RATE = 120.0  # £ per hour

# Table 5: Maximum Hours Available per Machine Per Quarter
MACHINE_HOURS_PER_SHIFT = {1: 576, 2: 1068, 3: 1602}
MACHINISTS_PER_MACHINE = {1: 4, 2: 8, 3: 12}

# Table 6: Valuation of Rejected Products (Scrap Value)
SCRAP_VALUE = {"Product 1": 20.0, "Product 2": 40.0, "Product 3": 60.0}

# Table 7: Guarantee Servicing Charges
SERVICING_CHARGE = {"Product 1": 60.0, "Product 2": 120.0, "Product 3": 200.0}

# Table 8: Production Costs
SUPERVISION_COST_PER_SHIFT = 10_000
PRODUCTION_OVERHEAD_PER_MACHINE = 2000
MACHINE_RUNNING_COST_PER_HOUR = 7
PRODUCTION_PLANNING_COST_PER_UNIT = 1

# Table 9: Standard Vehicle Capacity
VEHICLE_CAPACITY = {"Product 1": 40, "Product 2": 40, "Product 3": 20}

# Table 10: Return Journey Times
JOURNEY_TIME_DAYS = {"South": 1, "West": 2, "North": 4, "Export": 6}

# Table 11: Transport Costs
FLEET_FIXED_COST_PER_VEHICLE = 7000  # per quarter
OWN_VEHICLE_RUNNING_COST_PER_DAY = 50
HIRED_VEHICLE_COST_PER_DAY = 200
MAX_VEHICLE_DAYS_PER_QUARTER = 60

# Table 12: Warehousing and Purchasing
FACTORY_STORAGE_CAPACITY = 2000  # units
FIXED_QUARTERLY_WAREHOUSE_COST = 3750
FIXED_QUARTERLY_ADMIN_COST = 3250
COST_PER_ORDER = 750
VARIABLE_EXTERNAL_STORAGE_COST = 1.50  # per unit
PRODUCT_STORAGE_COST = 2.0  # per unit per quarter

# Table 13: Calculation of Average Quarterly Stocks
# Uses formula: 0.5 * (opening + closing + quantity at each delivery)

# Table 14: Material Suppliers' Terms of Trade
SUPPLIERS = {
    0: {"discount": 0.0, "delivery_charge": 0, "min_delivery": 1, "min_order": 1, "deliveries": "just_in_time"},
    1: {"discount": 0.10, "delivery_charge": 200, "min_delivery": 1, "min_order": 1, "deliveries": "multiple"},
    2: {"discount": 0.15, "delivery_charge": 300, "min_delivery": 1000, "min_order": 10_000, "deliveries": "multiple"},
    3: {"discount": 0.30, "delivery_charge": 100, "min_delivery": 0, "min_order": 50_000, "deliveries": 12},  # weekly
}

# Table 15: Personnel Department Costs
RECRUITMENT_COST = {"Salesperson": 1500, "Assembly worker": 1200, "Machinist": 750}
DISMISSAL_COST = {"Salesperson": 5000, "Assembly worker": 3000, "Machinist": 1500}
TRAINING_COST = {"Salesperson": 6000, "Assembly worker": 4500, "Machinist": 0}

# Table 16: Maximum Hours per Quarter for each Production Worker
WORKER_HOURS = {
    1: {"basic": 420, "saturday": 84, "sunday": 72, "machinist_premium": 0},
    2: {"basic": 420, "saturday": 42, "sunday": 72, "machinist_premium": 1/3},
    3: {"basic": 420, "saturday": 42, "sunday": 72, "machinist_premium": 2/3},
}

# Table 17: Minimum Hours and Pay
MACHINIST_MIN_HOURS = 400  # per quarter
ASSEMBLY_STRIKE_HOURS_PER_WEEK = 48
ASSEMBLY_MIN_WAGE_RATE = 8.50  # £ per hour
UNSKILLED_SKILLED_RATIO = 0.65
MIN_SALES_SALARY_PER_QUARTER = 2000
MIN_MANAGEMENT_BUDGET = 40_000

# Table 18: Fixed Assets
MACHINE_COST = 200_000
MACHINE_DEPOSIT = 100_000  # 50% at order
VEHICLE_COST = 15_000
MACHINE_DEPRECIATION_RATE = 0.025  # per quarter (2.5%)
VEHICLE_DEPRECIATION_RATE = 0.0625  # per quarter (6.25%)

# Table 19: Methods of calculating Financial Limits
# Overdraft Limit = 100% Cash + 100% Product Stocks + 50% (Machines + Vehicles + Materials + Debtors) + 25% Property - 100% (Tax + Creditors)
# Creditworthiness = Overdraft Limit - Bank Overdraft - Unsecured Loans - £100k per machine ordered

# Table 20: Financial Parameters
TAX_RATE = 0.30  # 30% per annum
FIXED_OVERHEADS_PER_QUARTER = 10_000
VARIABLE_OVERHEAD_RATE = 0.0025  # 0.25% per quarter
CREDIT_CONTROL_COST_PER_UNIT = 1.50
INTEREST_RATE_DEPOSIT_SPREAD = -2.0  # bank rate - 2%
INTEREST_RATE_OVERDRAFT_SPREAD = 4.0  # bank rate + 4%
INTEREST_RATE_LOAN_SPREAD = 10.0  # bank rate + 10%

# Table 21: Stock Valuations
PRODUCT_STOCK_VALUATION = {"Product 1": 80.0, "Product 2": 120.0, "Product 3": 200.0}
# Material stock = 50% of last quarter's material price per unit

# Table 22: Timing of Payments to Creditors
PAYMENT_TIMING = {
    "Advertising": {"next": 0.0, "after_next": 1.0},
    "Guarantee_Servicing": {"next": 0.0, "after_next": 1.0},
    "Hired_Transport": {"next": 0.0, "after_next": 1.0},
    "Product_Development": {"next": 1.0, "after_next": 0.0},
    "Personnel_Department": {"next": 1.0, "after_next": 0.0},
    "Maintenance": {"next": 0.0, "after_next": 1.0},
    "Warehousing_Purchasing": {"next": 1.0, "after_next": 0.0},
    "External_stockholding": {"next": 0.0, "after_next": 1.0},
    "Business_Intelligence": {"next": 0.0, "after_next": 1.0},
    "Other_Miscellaneous": {"next": 0.0, "after_next": 1.0},
    "Materials_Purchased": {"next": 0.0, "after_next": 1.0},
    "Machines_Purchased": {"next": 0.5, "after_next": 0.5},  # 50% deposit, 50% on installation
    "Interest": {"next": 1.0, "after_next": 0.0},
}

# Table 23: Customers' credit discount structure
CREDIT_DISCOUNTS = {
    (0, 7): 0.10,
    (8, 15): 0.075,
    (16, 29): 0.05,
    (30, 999): 0.0,
}

# Base economic values
BASE_GDP = 100.0
BASE_UNEMPLOYMENT = 6.0
BASE_CB_RATE = 3.0
BASE_MATERIAL_PRICE = 100.0  # per 1000 units

# Training limitations
MAX_TRAINEES_PER_CATEGORY_PER_QUARTER = 9

# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class Economy:
    quarter: int = 1
    year: int = 1
    gdp: float = BASE_GDP
    unemployment: float = BASE_UNEMPLOYMENT
    cb_rate: float = BASE_CB_RATE  # for next quarter
    material_price: float = BASE_MATERIAL_PRICE  # per 1000 units, for next quarter
    
    def advance(self):
        """Advance economy to next quarter - simplified for now"""
        self.quarter += 1
        if self.quarter > 4:
            self.quarter = 1
            self.year += 1
        
        # Simplified economic model - should be preset in real simulation
        shock = np.random.normal(0, 1.5)
        self.gdp = max(80, self.gdp * (1 + shock / 100))
        
        u_shock = np.random.normal(0, 0.3)
        self.unemployment = min(15, max(2, self.unemployment + u_shock - shock / 40))
        
        rate_target = 2.5 + (self.gdp - BASE_GDP) / 40
        self.cb_rate = max(0.25, 0.75 * self.cb_rate + 0.25 * rate_target)
        
        self.material_price = max(60, self.material_price * (1 + (self.cb_rate - 2.5) / 200 + np.random.normal(0, 0.01)))


@dataclass
class ProductImprovement:
    """Track product development improvements"""
    product: str
    type: str  # "MAJOR" or "MINOR"
    quarter_reported: int
    year_reported: int
    implemented: bool = False


@dataclass
class MaterialOrder:
    """Track material orders"""
    quantity: float
    supplier: int
    num_deliveries: int
    order_quarter: int
    order_year: int
    delivery_quarter: int  # quarter after next
    delivery_year: int


@dataclass
class MachineOrder:
    """Track machine orders"""
    quantity: int
    order_quarter: int
    order_year: int
    deposit_paid: bool = False
    installed: bool = False


@dataclass
class Decisions:
    """All decisions for a quarter - matches Decision Form structure"""
    # Product improvements
    implement_major_improvement: Dict[str, bool] = field(default_factory=lambda: {p: False for p in PRODUCTS})
    
    # Prices
    prices_export: Dict[str, float] = field(default_factory=lambda: {p: 0.0 for p in PRODUCTS})
    prices_home: Dict[str, float] = field(default_factory=lambda: {p: 0.0 for p in PRODUCTS})
    
    # Promotion (advertising) - three types per product per area
    advertising_trade_press: Dict[Tuple[str, str], float] = field(default_factory=dict)
    advertising_support: Dict[Tuple[str, str], float] = field(default_factory=dict)
    advertising_merchandising: Dict[Tuple[str, str], float] = field(default_factory=dict)
    
    # Assembly time per product
    assembly_time: Dict[str, float] = field(default_factory=lambda: {p: MIN_ASSEMBLY_TIME[p] for p in PRODUCTS})
    
    # Salespeople allocation
    salespeople_allocation: Dict[str, int] = field(default_factory=lambda: {a: 0 for a in AREAS})
    
    # Salespeople remuneration
    sales_salary_per_quarter: float = MIN_SALES_SALARY_PER_QUARTER
    sales_commission_percent: float = 0.0
    
    # Assembly worker wage rate
    assembly_wage_rate: float = ASSEMBLY_MIN_WAGE_RATE
    
    # Shift level
    shift_level: int = 1
    
    # Management budget
    management_budget: float = MIN_MANAGEMENT_BUDGET
    
    # Maintenance
    maintenance_hours_per_machine: float = 0.0
    
    # Dividend
    dividend_per_share: float = 0.0  # pence per share
    
    # Credit terms
    credit_days: int = 30
    
    # Vehicles
    vans_to_buy: int = 0
    vans_to_sell: int = 0
    
    # Information purchases
    buy_competitor_info: bool = False
    buy_market_shares: bool = False
    
    # Deliveries (production schedule)
    deliveries: Dict[Tuple[str, str], int] = field(default_factory=dict)
    
    # Product development
    product_development: Dict[str, float] = field(default_factory=lambda: {p: 0.0 for p in PRODUCTS})
    
    # Salespeople
    recruit_sales: int = 0
    dismiss_sales: int = 0
    train_sales: int = 0
    
    # Assembly workers
    recruit_assembly: int = 0
    dismiss_assembly: int = 0
    train_assembly: int = 0
    
    # Materials
    materials_quantity: float = 0.0
    materials_supplier: int = 0
    materials_num_deliveries: int = 0
    
    # Machines
    machines_to_sell: int = 0
    machines_to_order: int = 0


@dataclass
class CompanyState:
    """Complete company state - matches Management Report structure"""
    name: str
    
    # Share capital
    shares_outstanding: float = 1_000_000.0
    share_price: float = 1.0
    
    # Fixed assets
    property_value: float = 500_000.0  # fixed, no depreciation
    machines: int = 10
    machines_ordered: List[MachineOrder] = field(default_factory=list)
    machine_efficiency: float = 1.0  # 0-1, starts at 100%
    vehicles: int = 5
    vehicles_age_quarters: List[int] = field(default_factory=lambda: [0] * 5)
    
    # Inventory
    material_stock: float = 5_000.0
    material_orders: List[MaterialOrder] = field(default_factory=list)
    stocks: Dict[Tuple[str, str], int] = field(default_factory=dict)  # (product, area) -> units
    backlog: Dict[Tuple[str, str], int] = field(default_factory=dict)  # (product, area) -> units
    
    # Personnel
    salespeople: int = 10
    assembly_workers: int = 40
    machinists: int = 40  # = machines * 4 * shift_level
    
    # Personnel in training/pending
    salespeople_in_training: int = 0  # will be available quarter after next
    assembly_workers_in_training: int = 0
    
    # Pay rates
    sales_salary: float = MIN_SALES_SALARY_PER_QUARTER
    sales_commission_rate: float = 0.0
    assembly_wage_rate: float = ASSEMBLY_MIN_WAGE_RATE
    
    # Financial
    cash: float = 200_000.0
    overdraft: float = 0.0
    unsecured_loan: float = 0.0
    reserves: float = 0.0
    tax_liability: float = 0.0
    debtors: float = 0.0
    creditors: float = 0.0
    
    # Product improvements
    product_improvements: List[ProductImprovement] = field(default_factory=list)
    product_star_ratings: Dict[str, int] = field(default_factory=lambda: {p: 3 for p in PRODUCTS})  # 1-5 stars
    
    # Accumulated spending for product development
    product_dev_accumulated: Dict[str, float] = field(default_factory=lambda: {p: 0.0 for p in PRODUCTS})
    
    # Last shift level used
    last_shift_level: int = 1
    
    # Strike weeks (for next quarter, set at end of quarter before last)
    strike_weeks_next_quarter: int = 0
    
    # Historical data for reporting
    last_report: Dict = field(default_factory=dict)
    
    # Machine breakdowns tracking
    machine_breakdown_hours: float = 0.0
    
    def net_worth(self) -> float:
        """Calculate net worth for balance sheet"""
        # Assets
        assets = (
            self.cash
            + self.property_value
            + self._get_machine_value()
            + self._get_vehicle_value()
            + self._get_product_stock_value()
            + self._get_material_stock_value()
            + self.debtors
        )
        
        # Liabilities
        liabilities = (
            self.overdraft
            + self.unsecured_loan
            + self.tax_liability
            + self.creditors
        )
        
        return assets - liabilities
    
    def _get_machine_value(self) -> float:
        """Current depreciated value of machines"""
        # Simplified - in full version would track individual machine ages
        return self.machines * MACHINE_COST * 0.8  # approximate after depreciation
    
    def _get_vehicle_value(self) -> float:
        """Current depreciated value of vehicles"""
        # Simplified - track individual vehicle ages in full version
        total = 0.0
        for age in self.vehicles_age_quarters:
            value = VEHICLE_COST * ((1 - VEHICLE_DEPRECIATION_RATE) ** age)
            total += value
        return total
    
    def _get_product_stock_value(self) -> float:
        """Value of product stocks"""
        total = 0.0
        for (prod, area), qty in self.stocks.items():
            total += qty * PRODUCT_STOCK_VALUATION[prod]
        return total
    
    def _get_material_stock_value(self, last_material_price: float = BASE_MATERIAL_PRICE) -> float:
        """Value of material stock - 50% of last quarter's price"""
        return self.material_stock * (last_material_price / 1000.0) * 0.5


# Continue with Simulation class in next part due to length...

