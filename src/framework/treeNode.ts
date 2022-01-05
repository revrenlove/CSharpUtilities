export class TreeNode<T> {

    constructor(value: T, parent?: TreeNode<T>) {

        this.value = value;
        this.parent = parent;
        this.children = [];
    }

    public value: T;
    public children: TreeNode<T>[];
    public parent: TreeNode<T> | undefined;

    public isCircular(): Boolean {

        let parent = this.parent;

        while (parent !== undefined) {

            if (parent === this) {
                return true;
            }

            parent = parent.parent;
        }

        return false;
    }
}