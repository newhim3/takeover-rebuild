import {
    _decorator, Button, Color, Component, Label,
    Node, Sprite, UITransform, Vec3,
} from 'cc';

const { ccclass } = _decorator;

type UnitRecord = {
    name: string;
    unitType: string;
    cost: number;
    sampleNode: string;
};

const UNITS: UnitRecord[] = [
    { name: 'Guards', unitType: 'Infantry', cost: 100, sampleNode: 'Sample_IconT1_B_InfantryClass' },
    { name: 'Knights', unitType: 'Cavalry', cost: 180, sampleNode: 'Sample_IconT1_B_CavalryClass' },
    { name: 'Monks', unitType: 'Magic', cost: 150, sampleNode: 'Sample_IconT1_B_MagicClass' },
];
const SLOT_X = [-95, -30, 35];

@ccclass('RecruitmentController')
export class RecruitmentController extends Component {
    private panel: Node | null = null;
    private status: Label | null = null;
    private feedback: Label | null = null;
    private selectedCastle: Node | null = null;
    private units: UnitRecord[] = UNITS;
    private gold = 500;
    private garrisons = new Map<string, Map<string, number>>();

    start(): void {
        this.panel = this.node.getChildByName('RecruitmentPanel');
        if (!this.panel) {
            console.error('RecruitmentPanel is missing from Canvas');
            return;
        }
        this.panel.active = false;
        this.makeText('RecruitmentStatus', new Vec3(-212, 37), 14, new Color(255, 238, 174, 255), (label) => this.status = label);
        this.makeText('RecruitmentFeedback', new Vec3(-185, -57), 13, Color.WHITE, (label) => this.feedback = label);
        this.makeCloseButton();

        for (const castle of this.node.children.filter((child) => child.name === 'CastleGreenClass')) {
            const hit = castle.getComponent(UITransform);
            if (hit) {
                castle.on(Node.EventType.TOUCH_END, () => this.open(castle), this);
            }
        }

    }

    private open(castle: Node): void {
        if (!this.panel) return;
        this.selectedCastle = castle;
        this.panel.active = true;
        this.panel.setSiblingIndex(this.node.children.length - 1);
        this.renderButtons();
    }

    private renderButtons(): void {
        if (!this.panel) return;
        for (const child of [...this.panel.children]) {
            if (child.name.startsWith('RecruitButton_')) child.destroy();
        }
        this.setFeedback('点击单位图标招募');
        this.units.forEach((unit, index) => this.makeUnitButton(unit, index));
        this.refreshStatus();
    }

    private makeUnitButton(unit: UnitRecord, index: number): void {
        if (!this.panel || index >= SLOT_X.length) return;
        const buttonNode = new Node(`RecruitButton_${unit.unitType}`);
        buttonNode.layer = this.panel.layer;
        buttonNode.parent = this.panel;
        buttonNode.setPosition(SLOT_X[index], 3, 0);
        buttonNode.addComponent(UITransform).setContentSize(58, 64);
        const button = buttonNode.addComponent(Button);
        button.transition = Button.Transition.SCALE;
        button.zoomScale = 0.9;

        const iconNode = new Node('UnitImage');
        iconNode.layer = this.panel.layer;
        iconNode.parent = buttonNode;
        iconNode.setPosition(0, 9, 0);
        iconNode.addComponent(UITransform).setContentSize(40, 40);
        const sprite = iconNode.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        const frame = this.node.getChildByName(unit.sampleNode)?.getComponent(Sprite)?.spriteFrame;
        if (frame) {
            sprite.spriteFrame = frame;
            const width = frame.width || 1;
            const height = frame.height || 1;
            const scale = Math.min(40 / width, 40 / height, 2);
            iconNode.getComponent(UITransform)?.setContentSize(width * scale, height * scale);
        } else {
            console.warn(`Scene icon not found: ${unit.sampleNode}`);
        }

        const costNode = new Node('Cost');
        costNode.layer = this.panel.layer;
        costNode.parent = buttonNode;
        costNode.setPosition(0, -24, 0);
        costNode.addComponent(UITransform).setContentSize(58, 20);
        const costLabel = costNode.addComponent(Label);
        costLabel.fontSize = 12;
        costLabel.lineHeight = 16;
        costLabel.string = `${unit.cost} G`;
        costLabel.color = new Color(255, 245, 196, 255);
        buttonNode.on(Button.EventType.CLICK, () => this.recruit(unit), this);
    }

    private recruit(unit: UnitRecord): void {
        if (!this.selectedCastle) return;
        if (this.gold < unit.cost) {
            this.setFeedback(`金币不足，需要 ${unit.cost}`);
            return;
        }
        this.gold -= unit.cost;
        const key = this.selectedCastle.uuid;
        let garrison = this.garrisons.get(key);
        if (!garrison) {
            garrison = new Map<string, number>();
            this.garrisons.set(key, garrison);
        }
        garrison.set(unit.name, (garrison.get(unit.name) || 0) + 1);
        this.setFeedback(`已招募 ${unit.name} ×1`);
        this.refreshStatus();
        this.refreshCastleBadge(this.selectedCastle, garrison);
        console.info(`[Recruitment] castle=${key} unit=${unit.name} count=${garrison.get(unit.name)} gold=${this.gold}`);
    }

    private refreshStatus(): void {
        if (!this.status) return;
        const garrison = this.selectedCastle ? this.garrisons.get(this.selectedCastle.uuid) : null;
        const count = garrison ? [...garrison.values()].reduce((sum, value) => sum + value, 0) : 0;
        this.status.string = `金币 ${this.gold}   驻军 ${count}`;
    }

    private setFeedback(message: string): void {
        if (this.feedback) this.feedback.string = message;
    }

    private refreshCastleBadge(castle: Node, garrison: Map<string, number>): void {
        let badge = castle.getChildByName('GarrisonCount');
        if (!badge) {
            badge = new Node('GarrisonCount');
            badge.layer = castle.layer;
            badge.parent = castle;
            badge.setPosition(43, 55, 0);
            badge.addComponent(UITransform).setContentSize(56, 24);
            const label = badge.addComponent(Label);
            label.fontSize = 18;
            label.color = new Color(255, 245, 175, 255);
        }
        const count = [...garrison.values()].reduce((sum, value) => sum + value, 0);
        const label = badge.getComponent(Label);
        if (label) label.string = `×${count}`;
    }

    private makeText(name: string, position: Vec3, size: number, color: Color, assign: (label: Label) => void): void {
        if (!this.panel) return;
        const node = new Node(name);
        node.layer = this.panel.layer;
        node.parent = this.panel;
        node.setPosition(position);
        node.addComponent(UITransform).setContentSize(235, 25);
        const label = node.addComponent(Label);
        label.fontSize = size;
        label.lineHeight = size + 3;
        label.color = color;
        assign(label);
    }

    private makeCloseButton(): void {
        if (!this.panel) return;
        const node = new Node('RecruitmentClose');
        node.layer = this.panel.layer;
        node.parent = this.panel;
        node.setPosition(251, 54, 0);
        node.addComponent(UITransform).setContentSize(28, 28);
        const label = node.addComponent(Label);
        label.string = '×';
        label.fontSize = 26;
        label.color = Color.WHITE;
        node.addComponent(Button);
        node.on(Button.EventType.CLICK, () => { if (this.panel) this.panel.active = false; }, this);
    }
}
