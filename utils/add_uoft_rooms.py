#!/usr/bin/env python3
"""
Script to add University of Toronto rooms to the rooms table.
This imports comprehensive room data with capacity and testing capacity.
"""

import sys
import os
from math import floor

# Add backend directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.config import config
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# UofT Room data (tab-separated: Building\tRoom\tRoom Capacity\tTesting Capacity)
uoft_rooms_data = """AB Astronomy and Astrophysics	107	70	35
AB Astronomy and Astrophysics	114	37	18
AP Anthropology Building	120	35	0
AP Anthropology Building	124	23	0
BA Bahen Centre Information Tech	1130 Auditorium	160	84
BA Bahen Centre Information Tech	1160 Adel Sedra Auditorium	278	139
BA Bahen Centre Information Tech	1170 Auditorium	130	65
BA Bahen Centre Information Tech	1180	130	66
BA Bahen Centre Information Tech	1190 Auditorium	127	63
BA Bahen Centre Information Tech	1200	85	42
BA Bahen Centre Information Tech	1210	85	42
BA Bahen Centre Information Tech	1220	85	42
BA Bahen Centre Information Tech	1230	60	0
BA Bahen Centre Information Tech	1240	60	30
BA Bahen Centre Information Tech	2135	46	22
BA Bahen Centre Information Tech	2139	42	42
BA Bahen Centre Information Tech	2145	48	0
BA Bahen Centre Information Tech	2155	48	0
BA Bahen Centre Information Tech	2159	42	35
BA Bahen Centre Information Tech	2165	50	50
BA Bahen Centre Information Tech	2175	50	50
BA Bahen Centre Information Tech	2179	24	12
BA Bahen Centre Information Tech	2185	50	50
BA Bahen Centre Information Tech	2195	50	50
BA Bahen Centre Information Tech	B024	45	22
BA Bahen Centre Information Tech	B025	25	12
BA Bahen Centre Information Tech	B026	25	12
BF Bancroft Building	214	21	10
BF Bancroft Building	215	40	0
BF Bancroft Building	315	23	0
BF Bancroft Building	316	17	7
BF Bancroft Building	323	42	0
BL Claude T. Bissell Building	112	40	20
BL Claude T. Bissell Building	113	25	17
BL Claude T. Bissell Building	114	44	22
BL Claude T. Bissell Building	205	121	67
BL Claude T. Bissell Building	305	14	0
BL Claude T. Bissell Building	306	14	0
BL Claude T. Bissell Building	312	19	12
BL Claude T. Bissell Building	313	70	0
BL Claude T. Bissell Building	325	70	35
BL Claude T. Bissell Building	327	14	7
EP Stewart Building	111 TEAL	48	24
ES Earth Sciences Centre	1047	25	0
ES Earth Sciences Centre	1050 Reichman Family Lect	400	204
ES Earth Sciences Centre	4000 Use Bancroft Ave entrance	40	16
ES Earth Sciences Centre	4001 Use Bancroft Ave entrance	48	24
ES Earth Sciences Centre	B142 Placer Dome Classroom	94	48
ES Earth Sciences Centre	B149 C-I-L Classroom	90	47
EX Exam Centre	100 Exam Room	309	309
EX Exam Centre	200	336	336
EX Exam Centre	300 carrels	90	90
EX Exam Centre	310	108	108
EX Exam Centre	320	112	112
EX Exam Centre	340 Test and Exam Services	67	67
FE Bloor Street West-371	114	301	150
FE Bloor Street West-371	139	40	0
FE Bloor Street West-371	213 Alternate for LM 155	50	25
FE Bloor Street West-371	222 Replaces FE 135	40	8
FE Bloor Street West-371	230 Alternate for LM LM 161	143	72
FE Bloor Street West-371	238 Alternate for IN 209	21	0
FE Bloor Street West-371	24	45	15
FE Bloor Street West-371	240 Alternate for IN 204	41	20
FE Bloor Street West-371	324	30	0
FE Bloor Street West-371	326 two entrances, 326+327	36	0
FE Bloor Street West-371	328	30	0
FE Bloor Street West-371	33	35	0
GB Galbraith Building	119	104	51
GB Galbraith Building	120	104	51
GB Galbraith Building	220	104	53
GB Galbraith Building	221	104	53
GB Galbraith Building	244	104	51
GB Galbraith Building	248	104	0
GB Galbraith Building	303	89	49
GB Galbraith Building	304	74	74
HA Haultain Building	401 Loan to LSM 22/23	50	0
HA Haultain Building	403 Loan to LSM	72	0
HA Haultain Building	410 Loan to LSM 22/23	50	0
HS Health Sciences Building	100	34	17
HS Health Sciences Building	106	84	42
HS Health Sciences Building	108	54	27
HS Health Sciences Building	610	251	126
HS Health Sciences Building	614	23	12
HS Health Sciences Building	618	23	12
HS Health Sciences Building	696	23	12
HS Health Sciences Building	705	15	8
HS Health Sciences Building	715	16	8
IN Innis College	223E Seminar Room	19	10
IN Innis College	312E	40	20
IN Innis College	313E	19	10
KP Koffler House	108 Shoppers Drug Mart	187	92
KP Koffler House	113 Carlton Cards	36	18
MB Lassonde Mining Building	128	225	112
MC Mechanical Engineering Bldg	102 Lecture Theatre	354	188
MC Mechanical Engineering Bldg	252	133	70
MC Mechanical Engineering Bldg	254	134	68
MP McLennan Physical Laboratories	102	196	108
MP McLennan Physical Laboratories	103	196	108
MP McLennan Physical Laboratories	118	30	0
MP McLennan Physical Laboratories	134	92	44
MP McLennan Physical Laboratories	137	92	44
MP McLennan Physical Laboratories	202	196	107
MP McLennan Physical Laboratories	203	196	107
MS Medical Sciences Building	2158 JJR Macleod Auditorium	507	265
MS Medical Sciences Building	2170	140	75
MS Medical Sciences Building	2172	142	70
MS Medical Sciences Building	2173	80	40
MS Medical Sciences Building	2290	10	0
MS Medical Sciences Building	2394	12	0
MS Medical Sciences Building	3153	274	142
MS Medical Sciences Building	3154	250	132
MS Medical Sciences Building	3278	59	32
MS Medical Sciences Building	3290	14	0
MS Medical Sciences Building	4171	87	43
MS Medical Sciences Building	4279	87	43
MY Myhal Centre MCEIE	150 Lau Auditorium	468	125
MY Myhal Centre MCEIE	315 For exams combined with MY 317	36	48
MY Myhal Centre MCEIE	317 Divider w MY 315	36	0
MY Myhal Centre MCEIE	320	36	0
MY Myhal Centre MCEIE	330	72	36
MY Myhal Centre MCEIE	350	36	0
MY Myhal Centre MCEIE	360	72	36
MY Myhal Centre MCEIE	370	36	0
MY Myhal Centre MCEIE	380	72	32
MY Myhal Centre MCEIE	420	36	0
MY Myhal Centre MCEIE	430	36	0
MY Myhal Centre MCEIE	440	36	0
MY Myhal Centre MCEIE	480	36	0
MY Myhal Centre MCEIE	490	36	0
NL C David Naylor Building	6 Imperial Oil Lecture	174	89
OI O.I.S.E.	10200 CTL Days; ACE(Evening + Wknd)	21	0
OI O.I.S.E.	10204	17	0
OI O.I.S.E.	11200	15	0
OI O.I.S.E.	11204 CTL Days; ACE(Evening + Wknd)	19	0
OI O.I.S.E.	2198	23	0
OI O.I.S.E.	2199	20	0
OI O.I.S.E.	2205	32	10
OI O.I.S.E.	2211	32	10
OI O.I.S.E.	2212	150	0
OI O.I.S.E.	2214	80	0
OI O.I.S.E.	2227 Womens Studies(D)/ACE(E+Wknd)	24	0
OI O.I.S.E.	2279	40	0
OI O.I.S.E.	2281	28	0
OI O.I.S.E.	2286	40	0
OI O.I.S.E.	2289	23	0
OI O.I.S.E.	2295	40	0
OI O.I.S.E.	2296	40	0
OI O.I.S.E.	3310	25	0
OI O.I.S.E.	3311	40	0
OI O.I.S.E.	3312	25	0
OI O.I.S.E.	3322 Replacement for OI4410 20249	36	0
OI O.I.S.E.	4410	36	0
OI O.I.S.E.	4414	36	10
OI O.I.S.E.	4416	36	10
OI O.I.S.E.	4418	27	0
OI O.I.S.E.	4420	23	0
OI O.I.S.E.	4422	42	7
OI O.I.S.E.	4426	40	0
OI O.I.S.E.	5150	65	0
OI O.I.S.E.	5160	40	0
OI O.I.S.E.	5170	80	0
OI O.I.S.E.	5230	40	0
OI O.I.S.E.	5240	40	0
OI O.I.S.E.	5250	59	0
OI O.I.S.E.	5260	33	15
OI O.I.S.E.	5270	35	15
OI O.I.S.E.	5280	36	0
OI O.I.S.E.	5290	35	0
OI O.I.S.E.	7192	23	0
OI O.I.S.E.	8170	40	0
OI O.I.S.E.	8180	40	0
OI O.I.S.E.	8200	40	0
OI O.I.S.E.	8201	30	0
OI O.I.S.E.	8214	40	0
OI O.I.S.E.	8220	40	0
OI O.I.S.E.	8280	24	0
OI O.I.S.E.	C154 Drama Studio	50	0
OI O.I.S.E.	G162 Lower translation booth	508	250
PB Leslie Dan Pharmacy Building	255 The Pod	48	30
PB Leslie Dan Pharmacy Building	B150 OPA Lecture Hall	304	157
PB Leslie Dan Pharmacy Building	B250 APOTEX Lecture Hall	244	127
RL Robarts Library Building	14190 replaces 14081	25	0
RU Rehabilitation Sciences Bdg	1016 Conference Rm (RSI & SLP)	20	0
RU Rehabilitation Sciences Bdg	132 Large Classroom (shared)	80	0
RU Rehabilitation Sciences Bdg	140 Large Classroom (PT)	80	0
RU Rehabilitation Sciences Bdg	150 Medium Size Classroom (RSI)	40	0
RU Rehabilitation Sciences Bdg	201 Case Study Room (OT)	12	0
RU Rehabilitation Sciences Bdg	203 Case Study Room (OT)	12	0
RU Rehabilitation Sciences Bdg	205 Case Study Room (OT)	12	0
RU Rehabilitation Sciences Bdg	207 Case Study room (OT)	8	0
RU Rehabilitation Sciences Bdg	218 Case study room (PT)	8	0
RU Rehabilitation Sciences Bdg	220 Case study room (PT)	8	0
RU Rehabilitation Sciences Bdg	221 Small Group Room	10	0
RU Rehabilitation Sciences Bdg	222 Case Study room (SLP)	8	0
RU Rehabilitation Sciences Bdg	224 Case study room (SLP)	8	0
RU Rehabilitation Sciences Bdg	225 Small Group Room	10	0
RU Rehabilitation Sciences Bdg	230 Case study room (OT)	8	0
RU Rehabilitation Sciences Bdg	232 Case Study Room (OT)	12	0
RU Rehabilitation Sciences Bdg	234 Case Study Room (OT)	12	0
RU Rehabilitation Sciences Bdg	235 Joyce Howell Mason Rm (OT)	80	0
RU Rehabilitation Sciences Bdg	236 Case Study Room (OT)	12	0
RU Rehabilitation Sciences Bdg	238 Case Study Room (SLP)	12	0
RU Rehabilitation Sciences Bdg	240 Case Study Room (SLP)	12	0
RU Rehabilitation Sciences Bdg	251 Case Study Room (SLP)	12	0
RU Rehabilitation Sciences Bdg	255 Case Study Room (SLP)	12	0
RU Rehabilitation Sciences Bdg	256 Case Study Room (OT)	8	0
RU Rehabilitation Sciences Bdg	31 Small Group Room	10	0
RU Rehabilitation Sciences Bdg	35 Small Group Room	10	0
RU Rehabilitation Sciences Bdg	420 Orthotics Lab (OT)	40	0
RU Rehabilitation Sciences Bdg	428 Dorothy Baer Rm (RSI)	20	0
RU Rehabilitation Sciences Bdg	444 Medium Classroom (SLP)	59	0
RU Rehabilitation Sciences Bdg	450 Small Group Room	10	0
RU Rehabilitation Sciences Bdg	452 Medium Classroom (RSS)	40	0
RU Rehabilitation Sciences Bdg	453 Medium Classroom (SLP)	60	0
RU Rehabilitation Sciences Bdg	490A (Shared)-RMVD 2013s	5	0
RU Rehabilitation Sciences Bdg	490B (Shared)-RMVD 2013s	5	0
RU Rehabilitation Sciences Bdg	490C (Shared)-RMVD 2013s	5	0
RU Rehabilitation Sciences Bdg	490D (Shared)-RMVD 2013s	5	0
RU Rehabilitation Sciences Bdg	490E (Shared)-RMVD 2013s	5	0
RU Rehabilitation Sciences Bdg	490F (Shared)-RMVD 2013s	5	0
RU Rehabilitation Sciences Bdg	492 Small Group Room	10	0
RU Rehabilitation Sciences Bdg	720 Health Concepts Lab (PT)	5	0
RU Rehabilitation Sciences Bdg	721 Case Study Room (PT)	12	0
RU Rehabilitation Sciences Bdg	727 Case Study Room (PT)	12	0
RU Rehabilitation Sciences Bdg	730 Clinical Teaching Lab (PT)	80	0
RU Rehabilitation Sciences Bdg	738 Case Study Room (PT)	12	0
RU Rehabilitation Sciences Bdg	740 Case Study Room (PT)	12	0
RU Rehabilitation Sciences Bdg	744 Case Study Room (PT)	12	0
RU Rehabilitation Sciences Bdg	750 Clinical Teaching Lab (PT)	80	0
RU Rehabilitation Sciences Bdg	753 Case Study Room (PT)	12	0
RU Rehabilitation Sciences Bdg	758 Case Study Room (PT)	12	0
RU Rehabilitation Sciences Bdg	759 Case Study Room (PT)	12	0
RU Rehabilitation Sciences Bdg	760 Clinical Teaching Lab (PT)	80	0
RU Rehabilitation Sciences Bdg	841 Conference Rm (PT)	20	0
RU Rehabilitation Sciences Bdg	907 (OT)	80	0
RU Rehabilitation Sciences Bdg	954 Cardwell & Robinson Rm (OT)	20	0
RW Ramsay Wright Laboratories	110	156	80
RW Ramsay Wright Laboratories	117	156	80
RW Ramsay Wright Laboratories	140	80	40
RW Ramsay Wright Laboratories	142 Lecture Room	49	21
RW Ramsay Wright Laboratories	143 Lecture Room	59	30
SF Sandford Fleming Building	1101	160	80
SF Sandford Fleming Building	1105 Blue Room	222	111
SF Sandford Fleming Building	2202 replaces WB 242	72	72
SF Sandford Fleming Building	3201 SOTL Classroom	72	36
SF Sandford Fleming Building	3202	112	112
SS Sidney Smith Hall	1069	97	48
SS Sidney Smith Hall	1070	71	35
SS Sidney Smith Hall	1071 Replaces SS 2128-2129	101	53
SS Sidney Smith Hall	1072	69	35
SS Sidney Smith Hall	1073	101	52
SS Sidney Smith Hall	1074	69	35
SS Sidney Smith Hall	1078 d	25	0
SS Sidney Smith Hall	1080 Small Lecture/Seminar	24	13
SS Sidney Smith Hall	1083	96	48
SS Sidney Smith Hall	1084	55	33
SS Sidney Smith Hall	1085	96	48
SS Sidney Smith Hall	1086	55	33
SS Sidney Smith Hall	1087	96	48
SS Sidney Smith Hall	1088	55	33
SS Sidney Smith Hall	2101	21	4
SS Sidney Smith Hall	2102	188	96
SS Sidney Smith Hall	2104 Replaces 2131 06s	15	4
SS Sidney Smith Hall	2105 Replaces 2130 06S	60	30
SS Sidney Smith Hall	2106	95	47
SS Sidney Smith Hall	2108	95	48
SS Sidney Smith Hall	2110 Two stns removed for adj table	93	46
SS Sidney Smith Hall	2111	40	0
SS Sidney Smith Hall	2112	15	7
SS Sidney Smith Hall	2114 Seminar/Collaborative	25	12
SS Sidney Smith Hall	2116	15	7
SS Sidney Smith Hall	2117	188	96
SS Sidney Smith Hall	2118	188	96
SS Sidney Smith Hall	2119	15	7
SS Sidney Smith Hall	2120 Seminar/Collaborative	14	12
SS Sidney Smith Hall	2125	60	24
SS Sidney Smith Hall	2127	85	42
SS Sidney Smith Hall	2135 Amphitheatre	188	100
SS Sidney Smith Hall	581	25	0
SU Student Commons	255	55	11
SU Student Commons	432 ARTSC Loan 2023-2024 ES1016M	23	0
SU Student Commons	440 Alternate for LM 123	28	0
SU Student Commons	444 Alternate for LM 157	42	21
SU Student Commons	B120 Alternate for LM 158	108	54
TC Trinity College	M117A Div Common Room	35	0
UC University College	140 Has Balcony Amphi	150	75
UC University College	144	55	29
UC University College	148	21	0
UC University College	152	45	22
UC University College	161 Amphitheatre	97	44
UC University College	163	56	44
UC University College	175	30	0
UC University College	177	30	0
UC University College	179 Media Room	110	0
UC University College	244	59	0
UC University College	248	21	0
UC University College	255	18	11
UC University College	256	45	22
UC University College	257	17	0
UC University College	261	48	24
UC University College	44	15	0
UC University College	51	11	0
UC University College	52	61	0
UC University College	53	12	0
UC University College	55	12	0
UC University College	57	14	0
UC University College	63	17	0
UC University College	65	25	0
UC University College	67	27	0
UC University College	69	17	0
UC University College	85	50	27
UC University College	87	50	27
UC University College	A101	36	0
UC University College	B203	19	0
UC University College	D301	19	0
UC University College	F204	17	0
WB Wallberg Building	116	240	120
WB Wallberg Building	119	62	30
WB Wallberg Building	130	80	40
WB Wallberg Building	219	62	30
WE Wetmore Hall-New College	69	20	10
WE Wetmore Hall-New College	74	24	11
WE Wetmore Hall-New College	75	26	0
WE Wetmore Hall-New College	76	20	7
WI Wilson Hall-New College	1016 Amphitheatre	156	83
WI Wilson Hall-New College	1017 Amphitheatre	117	61
WI Wilson Hall-New College	2006	22	10
WI Wilson Hall-New College	523	40	28
WI Wilson Hall-New College	524	50	0
WO Woodsworth College Residence	20	59	29
WO Woodsworth College Residence	25	55	27
WO Woodsworth College Residence	30	58	29
WO Woodsworth College Residence	35	56	28
WW Woodsworth College	119 Woodsworth Classroom	36	0
WW Woodsworth College	120 Woodsworth Classroom	36	0
WW Woodsworth College	120 Woodsworth Classroom	36	0
WW Woodsworth College	126 Woodsworth Classroom	80	40"""

def get_floor_from_room_number(room_number, building_code):
    """Try to extract floor number from room number"""
    room_str = str(room_number).strip()

    # Handle special cases first
    if room_str.startswith('B') and len(room_str) > 1 and room_str[1:].isdigit():
        return -1  # Basement

    # Try to parse as number and extract first digit for floor
    try:
        # For 3-digit numbers like 101, floor is first digit
        if len(room_str) == 3 and room_str.isdigit():
            floor = int(room_str[0])
            return floor

        # For 4-digit numbers like 1016, first digit might be building section, second digit floor
        if len(room_str) == 4 and room_str.isdigit():
            # Special logic for different buildings
            if building_code in ['SS', 'UC', 'WI']:  # Sidney Smith, University College, Wilson Hall
                return int(room_str[0])  # First digit = floor
            else:
                return int(room_str[0])  # Default to first digit

        # For larger numbers or letters like 4410, 10200, etc.
        # Try to find the first digit that's not the building floor indicator
        digits = [c for c in room_str if c.isdigit()]
        if len(digits) >= 2:
            return int(digits[0])  # First digit as floor

        # Single digit room numbers
        elif len(digits) == 1:
            return int(digits[0]) if int(digits[0]) >= 1 else 1

    except (ValueError, IndexError):
        pass

    return 1  # Default to floor 1

def get_room_type_from_capacity(capacity, room_number):
    """Categorize room type based on capacity and room number"""
    capacity = int(capacity)

    # Valid room types based on database constraints
    if capacity >= 200:
        return "auditorium"
    elif capacity >= 100:
        return "classroom"
    elif capacity >= 40:
        return "classroom"
    elif capacity >= 20:
        return "classroom"
    else:
        return "seminar"

def get_room_equipment(capacity, room_type):
    """Generate equipment list based on capacity and type"""
    equipment = []

    if capacity >= 50:
        equipment.append("projector")
    if capacity >= 30:
        equipment.append("whiteboard")
    if capacity >= 20:
        equipment.append("computer")
    if "lecture" in room_type.lower() or capacity >= 100:
        equipment.append("microphone")
        equipment.append("speaker")

    return equipment

def main():
    """Add UofT rooms to the database"""

    # Initialize Flask app
    app = Flask(__name__)
    app.config.from_object(config['development'])
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = SQLAlchemy(app)

    with app.app_context():
        try:
            # Define models inline with the same fields
            class Building(db.Model):
                """Enterprise-grade Building model mapping to 'buildings' table"""
                __tablename__ = 'buildings'

                id = db.Column(db.Integer, primary_key=True)
                building_code = db.Column(db.String(10), unique=True, nullable=False)
                building_name = db.Column(db.String(200), nullable=False)
                campus = db.Column(db.String(50))
                full_address = db.Column(db.Text)
                latitude = db.Column(db.Float)
                longitude = db.Column(db.Float)
                building_type = db.Column(db.String(50))
                year_constructed = db.Column(db.Integer)
                total_floors = db.Column(db.Integer)
                accessible_entrances = db.Column(db.Text)
                emergency_exits = db.Column(db.Text)
                fire_systems_installation = db.Column(db.Date)
                last_inspection_date = db.Column(db.Date)
                inspection_frequency_months = db.Column(db.Integer, default=12)
                next_inspection_date = db.Column(db.Date)
                capacity_override = db.Column(db.Integer)
                accessibility_rating = db.Column(db.Integer)
                maintenance_priority = db.Column(db.String(10), default='normal')
                emergency_contact_name = db.Column(db.String(150))
                emergency_contact_phone = db.Column(db.String(20))
                is_active = db.Column(db.Boolean, default=True)
                created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
                updated_at = db.Column(db.DateTime, default=db.func.current_timestamp())

            class Room(db.Model):
                """Enterprise-grade Room model mapping to 'rooms' table"""
                __tablename__ = 'rooms'

                id = db.Column(db.Integer, primary_key=True)
                building_id = db.Column(db.Integer, db.ForeignKey('buildings.id'), nullable=False)
                room_number = db.Column(db.String(20), nullable=False)
                room_name = db.Column(db.String(100))
                floor_number = db.Column(db.Integer, default=1)
                capacity = db.Column(db.Integer, nullable=False)
                exam_capacity = db.Column(db.Integer)
                room_type = db.Column(db.String(50))
                # Temporarily remove department_id foreign key for import
                technology_equipment = db.Column(db.Text, default='[]')
                accessibility_features = db.Column(db.Text, default='[]')
                seating_arrangement = db.Column(db.String(50), default='theater')
                chalkboards_count = db.Column(db.Integer, default=0)
                whiteboards_count = db.Column(db.Integer, default=0)
                projectors_count = db.Column(db.Integer, default=0)
                computers_count = db.Column(db.Integer, default=0)
                square_footage = db.Column(db.Integer)
                room_restrictions = db.Column(db.Text, default='[]')
                is_active = db.Column(db.Boolean, default=True)
                is_bookable = db.Column(db.Boolean, default=True)
                maintenance_schedule = db.Column(db.Text, default='{}')
                created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
                updated_at = db.Column(db.DateTime, default=db.func.current_timestamp())

            rooms_added = 0
            buildings_matched = 0
            skipped = 0
            errors = 0

            # Parse the room data (tab-separated)
            lines = uoft_rooms_data.strip().split('\n')

            for line in lines:
                if not line.strip():
                    continue

                # Split by tabs
                parts = line.split('\t')
                if len(parts) < 4:
                    errors += 1
                    continue

                building_name = parts[0].strip()
                room_number = parts[1].strip()
                room_capacity = parts[2].strip()
                testing_capacity = parts[3].strip()

                # Extract building code from the building name (first part)
                building_code = building_name.split()[0]

                try:
                    capacity = int(room_capacity)
                    exam_capacity = int(testing_capacity) if testing_capacity.isdigit() else 0

                    # Constraint check: exam_capacity must be >= capacity OR NULL
                    if exam_capacity > 0 and exam_capacity < capacity:
                        # For exam rooms, exam_capacity specified amount should be added to capacity
                        exam_capacity = capacity + exam_capacity
                except ValueError:
                    errors += 1
                    continue

                # Find the building in our database
                building = Building.query.filter_by(building_code=building_code).first()
                if not building:
                    errors += 1
                    continue

                buildings_matched += 1

                # Check if room already exists
                existing_room = Room.query.filter_by(
                    building_id=building.id,
                    room_number=room_number
                ).first()

                if existing_room:
                    skipped += 1
                    continue  # Skip existing rooms

                # Extract room name from room_number if it contains description
                room_display_name = None
                actual_room_number = room_number

                # Handle rooms with descriptions like "111 TEAL"
                if ' ' in room_number:
                    room_parts = room_number.split(' ', 1)
                    actual_room_number = room_parts[0]
                    room_display_name = room_parts[1]

                # Determine floor, type, and equipment
                floor = get_floor_from_room_number(actual_room_number, building_code)
                room_type = get_room_type_from_capacity(capacity, actual_room_number)
                equipment = get_room_equipment(capacity, room_type)

                # Create room record with enterprise fields
                room_name = room_display_name or f"Room {actual_room_number}"
                square_footage = capacity * 10  # Rough estimate: 10 sq ft per person

                room = Room(
                    building_id=building.id,
                    room_number=actual_room_number,
                    room_name=room_name,
                    floor_number=floor,
                    capacity=capacity,
                    exam_capacity=exam_capacity if exam_capacity > 0 else None,
                    room_type=room_type,
                    technology_equipment='{' + ','.join(equipment) + '}',
                    accessibility_features='{wheelchair_accessible,ramp}',
                    seating_arrangement='theater' if capacity >= 50 else 'classroom',
                    chalkboards_count=1 if capacity < 50 else 0,
                    whiteboards_count=1 if capacity >= 20 else 0,
                    projectors_count=1 if capacity >= 30 else 0,
                    computers_count=1 if capacity >= 20 else 0,
                    square_footage=square_footage,
                    room_restrictions='{}',
                    is_active=True,
                    is_bookable=True,
                    maintenance_schedule='{"last_cleaned": "2024-01-01"}'
                )

                try:
                    # Add and commit each room individually
                    db.session.add(room)
                    db.session.commit()  # Commit each room individually
                    rooms_added += 1

                    if rooms_added <= 5:  # Only show first 5 additions for brevity
                        print(f"[OK] Added room: {building_code}-{actual_room_number} (Capacity: {capacity})")

                    if rooms_added % 50 == 0 and rooms_added > 0:
                        print(f"[INFO] Progress: {rooms_added} rooms added so far...")

                except Exception as room_error:
                    # Rollback only this single room transaction
                    db.session.rollback()
                    errors += 1
                    # Continue with next room instead of failing entirely

            print("\n" + "="*60)
            print("UofT ROOMS IMPORT COMPLETE")
            print(f"[OK] Rooms added: {rooms_added}")
            print(f"[OK] Buildings matched: {buildings_matched}")
            print(f"[INFO] Errors/info: {errors}")
            print(f"[INFO] Total rooms in database: {Room.query.count()}")
            print("="*60)

        except Exception as e:
            db.session.rollback()
            print(f"[ERROR] Error adding rooms: {e}")
            import traceback
            traceback.print_exc()
            return 1

    return 0

if __name__ == '__main__':
    sys.exit(main())
