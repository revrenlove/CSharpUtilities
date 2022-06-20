import { Md5 } from 'ts-md5/dist/md5';

export class TreeNode<T> {

    private readonly valueHash: string;

    constructor(value: NonNullable<T>, parent?: TreeNode<T>) {

        this.value = value;
        this.parent = parent;
        this.children = [];

        this.valueHash = Md5.hashStr(JSON.stringify(this.value));
    }

    public value: NonNullable<T>;
    public children: TreeNode<T>[];
    public parent: TreeNode<T> | undefined;

    // TODO: Maybe add a method that accepts a lambda for building out the tree...

    public isCircular(): boolean {

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