export const isWithableProps = <T>(
    obj: T,
    props: string
): boolean => {
    const validVarNameReg: RegExp = /^([^\x00-\xff]|[a-zA-Z_$])([^\x00-\xff]|[a-zA-Z0-9_$])*$/;

    return !!Object.getOwnPropertyDescriptor(obj, props) && Object.getOwnPropertyDescriptor(obj, props).writable && validVarNameReg.test(props);
}