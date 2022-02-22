import { Md5 } from 'ts-md5/dist/md5';

export class TreeNode {

    private readonly valueHash: string;

    constructor(value: NonNullable<any>, parent?: TreeNode) {

        this.value = value;
        this.parent = parent;
        this.children = [];

        this.valueHash = Md5.hashStr(JSON.stringify(this.value));
    }

    public value: NonNullable<any>;
    public children: TreeNode[];
    public parent: TreeNode | undefined;

    public isCircular(): Boolean {

        let parent = this.parent;

        while (parent !== undefined) {

            if (parent.valueHash === this.valueHash) {
                return true;
            }

            parent = parent.parent;
        }

        return false;
    }
}